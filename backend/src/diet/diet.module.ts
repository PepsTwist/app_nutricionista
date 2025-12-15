// backend/src/diet/diet.module.ts

import { Module, forwardRef } from '@nestjs/common'; // 1. Importe forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietService } from './diet.service';
import { DietController } from './diet.controller';
import { DietPlan } from './diet-plan.entity';
import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';
import { Patient } from 'src/patients/patient.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DietPlan, Meal, MealItem, Patient]),
    // 2. Use forwardRef para quebrar o ciclo com AuthModule
    forwardRef(() => AuthModule),
  ],
  controllers: [DietController],
  providers: [DietService],
  exports: [DietService],
})
export class DietModule {}
