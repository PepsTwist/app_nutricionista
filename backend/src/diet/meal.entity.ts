// backend/src/diet/meal.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DietPlan } from './diet-plan.entity';
import { MealItem } from './meal-item.entity';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  time: string;

  /**
   * O dia da semana para esta refeição.
   * Ex: "Segunda-feira", "Terça-feira", etc.
   */
  // --- AQUI ESTÁ A CORREÇÃO ---
  // Adicionamos `nullable: true` para permitir que as refeições antigas
  // (que não têm um dia da semana) continuem a existir no banco de dados.
  @Column({ type: 'varchar', nullable: true })
  dayOfWeek: string;

  @ManyToOne(() => DietPlan, (dietPlan) => dietPlan.meals, {
    onDelete: 'CASCADE',
  })
  dietPlan: DietPlan;

  @OneToMany(() => MealItem, (item) => item.meal, { cascade: true })
  items: MealItem[];
}
