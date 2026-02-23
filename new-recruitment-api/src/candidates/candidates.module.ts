import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { Candidate } from '../entities/candidate.entity';
import { JobOffer } from '../entities/job-offer.entity';
import { LegacyApiModule } from '../legacy-api/legacy-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, JobOffer]), LegacyApiModule,],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
