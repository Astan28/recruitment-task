import { Injectable, Logger, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

interface LegacyCandidate {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable()
export class LegacyApiService {
  private readonly logger = new Logger(LegacyApiService.name);
  private readonly legacyApiUrl: string;
  private readonly legacyApiKey: string;
constructor(
  private readonly httpService: HttpService,
  private readonly configService: ConfigService,
) {
  const apiUrl = this.configService.get<string>('LEGACY_API_URL');
  const apiKey = this.configService.get<string>('LEGACY_API_KEY');
  if (!apiUrl || !apiKey) {
    throw new Error('LEGACY_API_URL and LEGACY_API_KEY must be set in environment');
  }
  this.legacyApiUrl = apiUrl;
  this.legacyApiKey = apiKey;
}
  async createCandidate(candidate: LegacyCandidate): Promise<void> {
    try {
      this.logger.log(`Creating candidate in legacy API: ${candidate.email}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.legacyApiUrl}/candidates`,
          candidate,
          {
            headers: {
              'x-api-key': this.legacyApiKey,
            },
          },
        ),
      );

      this.logger.log(`Candidate created in legacy API: ${candidate.email}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create candidate in legacy API: ${error.message}`,
        error.stack,
      );

      
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          throw new ConflictException(
            `Candidate with email ${candidate.email} already exists in legacy system`,
          );
        }
        if (error.response?.status === 400) {
          throw new InternalServerErrorException(
            `Legacy API rejected the candidate data: ${error.response.data?.message || 'Bad request'}`,
          );
        }
      }

      throw new InternalServerErrorException(
        'Failed to sync candidate with legacy system',
      );
    }
  }
}