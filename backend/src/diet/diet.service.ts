// backend/src/diet/diet.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DietPlan } from './diet-plan.entity';
import { Patient } from '../patients/patient.entity';
import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';
import { CreateDietPlanDto } from './dto/create-diet-plan.dto';
import { User } from '../users/user.entity';
import { UpdateDietPlanDto } from './dto/update-diet-plan.dto';

@Injectable()
export class DietService {
  constructor(
    @InjectRepository(DietPlan)
    private dietPlanRepository: Repository<DietPlan>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private dataSource: DataSource,
  ) {}

  // --- MÉTODOS PARA O PACIENTE ---

  async findAllMyPlans(patientId: string): Promise<DietPlan[]> {
    return this.dietPlanRepository.find({
      where: { patient: { id: patientId } },
      select: ['id', 'name', 'description', 'createdAt', 'isActive'],
      order: { createdAt: 'DESC' },
    });
  }

  // =================================================================
  // --- MÉTODO QUE ESTÁ FALTANDO ---
  // Este método precisa existir para corrigir o erro de compilação.
  // =================================================================
  async findOneForPatient(
    planId: string,
    patientId: string,
  ): Promise<DietPlan> {
    const plan = await this.dietPlanRepository.findOne({
      where: {
        id: planId,
        patient: { id: patientId },
      },
      relations: ['meals', 'meals.items'],
    });

    if (!plan) {
      throw new NotFoundException(
        `Plano com ID ${planId} não encontrado ou não pertence a este paciente.`,
      );
    }
    return plan;
  }

  // --- MÉTODOS PARA O NUTRICIONISTA ---

  async create(
    createDietPlanDto: CreateDietPlanDto,
    nutritionist: User,
  ): Promise<DietPlan> {
    const { patientId, meals: mealDtos, ...restOfPlanDto } = createDietPlanDto;
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, nutritionist: { id: nutritionist.id } },
    });
    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID ${patientId} não encontrado ou não pertence a este nutricionista.`,
      );
    }
    const newPlan = this.dietPlanRepository.create({
      ...restOfPlanDto,
      patient,
      nutritionist,
      isActive: true,
    });
    const savedPlan = await this.dietPlanRepository.save(newPlan);
    if (mealDtos && mealDtos.length > 0) {
      const meals = mealDtos.map((mealDto) => {
        const newMeal = new Meal();
        newMeal.name = mealDto.name;
        newMeal.time = mealDto.time;
        newMeal.dayOfWeek = mealDto.dayOfWeek;
        newMeal.dietPlan = savedPlan;
        if (mealDto.items && mealDto.items.length > 0) {
          newMeal.items = mealDto.items.map((itemDto) => {
            const newItem = new MealItem();
            newItem.description = itemDto.description;
            newItem.quantity = itemDto.quantity;
            newItem.notes = itemDto.notes ?? null;
            return newItem;
          });
        }
        return newMeal;
      });
      await this.dataSource.getRepository(Meal).save(meals);
    }
    return this.findOneById(savedPlan.id, nutritionist.id);
  }

  async findAllForPatient(
    patientId: string,
    nutritionistId: string,
  ): Promise<DietPlan[]> {
    return this.dietPlanRepository.find({
      where: {
        patient: { id: patientId },
        nutritionist: { id: nutritionistId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(planId: string, nutritionistId: string): Promise<DietPlan> {
    const plan = await this.dietPlanRepository.findOne({
      where: { id: planId, nutritionist: { id: nutritionistId } },
      relations: ['patient', 'meals', 'meals.items'],
    });
    if (!plan) {
      throw new NotFoundException(`Plano com ID ${planId} não encontrado.`);
    }
    return plan;
  }

  async findActivePlanForPatient(patientId: string): Promise<DietPlan | null> {
    return this.dietPlanRepository.findOne({
      where: { patient: { id: patientId }, isActive: true },
      relations: { meals: { items: true } },
      order: { meals: { time: 'ASC' } },
    });
  }

  async update(
    planId: string,
    updateDietPlanDto: UpdateDietPlanDto,
    nutritionistId: string,
  ): Promise<DietPlan> {
    const plan = await this.findOneById(planId, nutritionistId);
    await this.dataSource.transaction(async (manager) => {
      const mealRepository = manager.getRepository(Meal);
      await mealRepository.delete({ dietPlan: { id: planId } });
      const { meals: mealDtos, ...restOfPlanDto } = updateDietPlanDto;
      await manager.getRepository(DietPlan).update(planId, restOfPlanDto);
      if (mealDtos && mealDtos.length > 0) {
        const newMeals = mealDtos.map((mealDto) => {
          const newMeal = new Meal();
          newMeal.name = mealDto.name;
          newMeal.time = mealDto.time;
          newMeal.dayOfWeek = mealDto.dayOfWeek;
          newMeal.dietPlan = plan;
          if (mealDto.items && mealDto.items.length > 0) {
            newMeal.items = mealDto.items.map((itemDto) => {
              const newItem = new MealItem();
              newItem.description = itemDto.description;
              newItem.quantity = itemDto.quantity;
              newItem.notes = itemDto.notes ?? null;
              return newItem;
            });
          }
          return newMeal;
        });
        await mealRepository.save(newMeals);
      }
    });
    return this.findOneById(planId, nutritionistId);
  }

  async remove(planId: string, nutritionistId: string): Promise<void> {
    const plan = await this.findOneById(planId, nutritionistId);
    if (!plan) {
      throw new NotFoundException(`Plano com ID ${planId} não encontrado.`);
    }
    await this.dietPlanRepository.delete(planId);
  }
}
