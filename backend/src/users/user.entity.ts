// backend/src/users/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { DietPlan } from '../diet/diet-plan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  crn: string;

  @OneToMany(() => Patient, (patient) => patient.nutritionist)
  patients: Patient[];

  @OneToMany(() => DietPlan, (plan) => plan.nutritionist)
  dietPlans: DietPlan[];
}
