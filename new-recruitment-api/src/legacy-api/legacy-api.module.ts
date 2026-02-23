import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LegacyApiService } from './legacy-api.service';

@Module({
  imports: [HttpModule],
  providers: [LegacyApiService],
  exports: [LegacyApiService],
})
export class LegacyApiModule {}