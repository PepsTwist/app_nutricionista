// backend/src/patients/patient.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { DietPlan } from '../diet/diet-plan.entity';
import { Anamnesis } from '../anamnesis/anamnesis.entity';
import { WeightRecord } from '../weight-records/weight-record.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: 'PASSWORD_RESET_REQUIRED' })
  status: string;

  // Relação com o Nutricionista (User)
  @ManyToOne(() => User, (user) => user.patients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'nutritionistId' }) // Define o nome da coluna da chave estrangeira
  nutritionist: User;

  // Coluna explícita para a chave estrangeira.
  // Isso é opcional se você usar @JoinColumn, mas pode ser útil para consultas.
  @Column()
  nutritionistId: string;

  // Relação com Planos Alimentares
  @OneToMany(() => DietPlan, (dietPlan) => dietPlan.patient)
  dietPlans: DietPlan[];

  // --- AQUI ESTÁ O REFINAMENTO ---
  // Relação com Anamnese. O @JoinColumn está na entidade Anamnesis,
  // então este é o lado "inverso" da relação.
  @OneToOne(() => Anamnesis, (anamnesis) => anamnesis.patient, {
    cascade: true, // cascade:true significa que ao salvar um paciente, a anamnese associada também será salva.
  })
  anamnesis: Anamnesis; // Não há @JoinColumn aqui.

  // Relação com Registros de Peso
  @OneToMany(() => WeightRecord, (weightRecord) => weightRecord.patient)
  weightRecords: WeightRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
