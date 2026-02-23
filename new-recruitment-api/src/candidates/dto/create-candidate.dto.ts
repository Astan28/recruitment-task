import { IsString, IsEmail, IsNotEmpty, IsInt, Min, IsEnum, IsDateString, IsOptional, IsArray, ArrayMinSize, ArrayNotEmpty } from 'class-validator';
import { CandidateStatus } from '../../entities/candidate.entity';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsString()
  @IsOptional()
  recruiterNotes?: string;

  @IsEnum(CandidateStatus)
  @IsNotEmpty()
  status: CandidateStatus;

  @IsDateString()
  @IsNotEmpty()
  consentDate: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  jobOfferIds: number[];
}
