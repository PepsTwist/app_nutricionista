// backend/src/weight-records/weight-record.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { Patient } from '../patients/patient.entity';

@Entity('weight_records')
export class WeightRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'date' })
  recordDate: Date;

  // --- CORREÇÃO AQUI ---
  @ManyToOne(() => Patient, (patient) => patient.weightRecords, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
