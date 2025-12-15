// backend/src/diet/dto/create-meal-item.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMealItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
