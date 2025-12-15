// backend/src/anamnesis/anamnesis.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';

@Entity('anamnesis')
export class Anamnesis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- CORREÇÃO: Adicionando nullable: true a todos os campos de texto ---
  @Column({ type: 'text', nullable: true })
  mainComplaint: string;

  @Column({ type: 'text', nullable: true })
  historyOfCurrentIllness: string;

  @Column({ type: 'text', nullable: true })
  pastMedicalHistory: string;

  @Column({ type: 'text', nullable: true })
  familyHistory: string;

  @Column({ type: 'text', nullable: true })
  lifestyle: string;

  @Column({ type: 'text', nullable: true })
  dietaryHistory: string;

  @OneToOne(() => Patient, (patient) => patient.anamnesis, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
