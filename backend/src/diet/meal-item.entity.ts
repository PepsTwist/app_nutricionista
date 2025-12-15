// backend/src/diet/meal-item.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { Meal } from './meal.entity';

@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  quantity: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // --- CORREÇÃO AQUI ---
  @ManyToOne(() => Meal, (meal) => meal.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  meal: Meal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
