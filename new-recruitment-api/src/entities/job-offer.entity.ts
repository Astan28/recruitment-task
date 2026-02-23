import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity('JobOffer')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'salary_range' })
  salaryRange: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToMany(() => Candidate, (candidate) => candidate.jobOffers)
  candidates: Candidate[];
}
