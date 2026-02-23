import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { LegacyApiService } from '../legacy-api/legacy-api.service';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Candidates (e2e)', () => {
  let app: INestApplication;
  let legacyApiService: LegacyApiService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    legacyApiService = app.get(LegacyApiService);

    
    jest
      .spyOn(legacyApiService, 'createCandidate')
      .mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    
    jest.clearAllMocks();
  });

  describe('POST /candidates', () => {
    it('should create a candidate successfully', async () => {
      const createCandidateDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Great candidate with strong skills',
        status: 'nowy',
        consentDate: '2026-02-20',
        jobOfferIds: [1],
      };

      const response = await request(app.getHttpServer())
        .post('/candidates')
        .send(createCandidateDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Great candidate with strong skills',
        status: 'nowy',
        consentDate: expect.any(String),
        createdAt: expect.any(String),
        jobOffers: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: expect.any(String),
          }),
        ]),
      });

      
      expect(legacyApiService.createCandidate).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
    });

    it('should fail when email already exists', async () => {
      const createCandidateDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john.doe@example.com',
        phone: '+48987654321',
        yearsOfExperience: 3,
        recruiterNotes: 'Another candidate',
        status: 'nowy',
        consentDate: '2026-02-21',
        jobOfferIds: [1],
      };

      const response = await request(app.getHttpServer())
        .post('/candidates')
        .send(createCandidateDto)
        .expect(409);

      expect(response.body.message).toContain(
        'Candidate with this email already exists',
      );

      
      expect(legacyApiService.createCandidate).not.toHaveBeenCalled();
    });

    it('should fail when required fields are missing', async () => {
      const invalidDto = {
        firstName: 'John',
        
        email: 'invalid@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        status: 'nowy',
        consentDate: '2026-02-20',
        jobOfferIds: [1],
      };

      await request(app.getHttpServer())
        .post('/candidates')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when email is invalid', async () => {
      const invalidDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Notes',
        status: 'nowy',
        consentDate: '2026-02-20',
        jobOfferIds: [1],
      };

      await request(app.getHttpServer())
        .post('/candidates')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when status is invalid', async () => {
      const invalidDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john2@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Notes',
        status: 'invalid-status',
        consentDate: '2026-02-20',
        jobOfferIds: [1],
      };

      await request(app.getHttpServer())
        .post('/candidates')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when no job offers provided', async () => {
      const invalidDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john3@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Notes',
        status: 'nowy',
        consentDate: '2026-02-20',
        jobOfferIds: [],
      };

      await request(app.getHttpServer())
        .post('/candidates')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when job offer does not exist', async () => {
      const invalidDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john4@example.com',
        phone: '+48123456789',
        yearsOfExperience: 5,
        recruiterNotes: 'Notes',
        status: 'nowy',
        consentDate: '2026-02-20',
        jobOfferIds: [999],
      };

      const response = await request(app.getHttpServer())
        .post('/candidates')
        .send(invalidDto)
        .expect(404);

      expect(response.body.message).toContain('Job offers not found');

      
      expect(legacyApiService.createCandidate).not.toHaveBeenCalled();
    });

    it('should create candidate with multiple job offers', async () => {
      const createCandidateDto = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+48111222333',
        yearsOfExperience: 7,
        recruiterNotes: 'Experienced candidate',
        status: 'w trakcie rozmów',
        consentDate: '2026-02-22',
        jobOfferIds: [1, 2],
      };

      const response = await request(app.getHttpServer())
        .post('/candidates')
        .send(createCandidateDto)
        .expect(201);

      expect(response.body.jobOffers).toHaveLength(2);
      expect(response.body.jobOffers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      );
    });

    it('should rollback transaction when legacy API fails', async () => {
      const candidateRepository = app.get<Repository<Candidate>>(
        getRepositoryToken(Candidate),
      );

      
      jest
        .spyOn(legacyApiService, 'createCandidate')
        .mockRejectedValueOnce(
          new Error('Failed to sync candidate with legacy system'),
        );

      const createCandidateDto = {
        firstName: 'Bob',
        lastName: 'Rollback',
        email: 'bob.rollback@example.com',
        phone: '+48555666777',
        yearsOfExperience: 3,
        recruiterNotes: 'This should rollback',
        status: 'nowy',
        consentDate: '2026-02-23',
        jobOfferIds: [1],
      };

      
      await request(app.getHttpServer())
        .post('/candidates')
        .send(createCandidateDto)
        .expect(500);

      
      const candidate = await candidateRepository.findOne({
        where: { email: 'bob.rollback@example.com' },
      });

      expect(candidate).toBeNull();

      
      expect(legacyApiService.createCandidate).toHaveBeenCalledWith({
        firstName: 'Bob',
        lastName: 'Rollback',
        email: 'bob.rollback@example.com',
      });
    });
  });

  describe('GET /candidates', () => {
    it('should return paginated list of candidates', async () => {
      const response = await request(app.getHttpServer())
        .get('/candidates?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toMatchObject({
          id: expect.any(Number),
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
          status: expect.any(String),
          jobOffers: expect.any(Array),
        });
      }
    });

    it('should use default pagination values when not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/candidates')
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should handle custom pagination values', async () => {
      const response = await request(app.getHttpServer())
        .get('/candidates?page=2&limit=5')
        .expect(200);

      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should include job offers in candidate data', async () => {
      const response = await request(app.getHttpServer())
        .get('/candidates')
        .expect(200);

      if (response.body.data.length > 0) {
        const candidate = response.body.data[0];
        expect(candidate.jobOffers).toBeDefined();
        expect(Array.isArray(candidate.jobOffers)).toBe(true);
        if (candidate.jobOffers.length > 0) {
          expect(candidate.jobOffers[0]).toHaveProperty('id');
          expect(candidate.jobOffers[0]).toHaveProperty('title');
        }
      }
    });
  });
});