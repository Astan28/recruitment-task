import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { JobOffer } from './job-offer.entity';

export enum CandidateStatus {
  NEW = 'nowy',
  IN_PROGRESS = 'w trakcie rozmów',
  ACCEPTED = 'zaakceptowany',
  REJECTED = 'odrzucony',
}

@Entity('Candidate')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  firstName: string;

  @Column({ type: 'text', nullable: false })
  lastName: string;

  @Column({ type: 'text', nullable: false, unique: true })
  email: string;

  @Column({ type: 'text', nullable: false })
  phone: string;

  @Column({ type: 'integer', nullable: false })
  yearsOfExperience: number;

  @Column({ type: 'text', nullable: true })
  recruiterNotes: string;

  @Column({
    type: 'text',
    nullable: false,
    default: CandidateStatus.NEW,
  })
  status: CandidateStatus;

  @Column({ type: 'datetime', nullable: false })
  consentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => JobOffer, (jobOffer) => jobOffer.candidates)
  @JoinTable({
    name: 'CandidateJobOffer',
    joinColumn: { name: 'candidateId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'jobOfferId', referencedColumnName: 'id' },
  })
  jobOffers: JobOffer[];
}
