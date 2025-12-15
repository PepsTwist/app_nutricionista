// backend/src/diet/diet-plan.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Patient } from '../patients/patient.entity';
import { Meal } from './meal.entity';

@Entity('diet_plans')
export class DietPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.dietPlans, { nullable: false })
  @JoinColumn({ name: 'nutritionistId' })
  nutritionist: User;

  @ManyToOne(() => Patient, (patient) => patient.dietPlans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @OneToMany(() => Meal, (meal) => meal.dietPlan, { cascade: true })
  meals: Meal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
