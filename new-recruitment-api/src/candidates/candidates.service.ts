import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { JobOffer } from '../entities/job-offer.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { LegacyApiService } from '../legacy-api/legacy-api.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    private legacyApiService: LegacyApiService,
    private dataSource: DataSource,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const existingCandidate = await this.candidateRepository.findOne({
      where: { email: createCandidateDto.email },
    });

    if (existingCandidate) {
      throw new ConflictException('Candidate with this email already exists');
    }

    const jobOffers = await this.jobOfferRepository.find({
      where: { id: In(createCandidateDto.jobOfferIds) },
    });

    if (jobOffers.length !== createCandidateDto.jobOfferIds.length) {
      throw new NotFoundException(
        `Job offers not found: ${createCandidateDto.jobOfferIds.filter((id) => !jobOffers.find((jo) => jo.id === id)).join(', ')}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const candidate = this.candidateRepository.create({
        firstName: createCandidateDto.firstName,
        lastName: createCandidateDto.lastName,
        email: createCandidateDto.email,
        phone: createCandidateDto.phone,
        yearsOfExperience: createCandidateDto.yearsOfExperience,
        recruiterNotes: createCandidateDto.recruiterNotes,
        status: createCandidateDto.status,
        consentDate: new Date(createCandidateDto.consentDate),
        jobOffers,
      });

      const savedCandidate = await queryRunner.manager.save(candidate);

      await this.legacyApiService.createCandidate({
        firstName: createCandidateDto.firstName,
        lastName: createCandidateDto.lastName,
        email: createCandidateDto.email,
      });

      await queryRunner.commitTransaction();

      const result = await this.candidateRepository.findOne({
        where: { id: savedCandidate.id },
        relations: ['jobOffers'],
      });

      if (!result) {
        throw new NotFoundException('Candidate not found after creation');
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ data: Candidate[]; meta: any }> {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.candidateRepository.findAndCount({
      relations: ['jobOffers'],
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
