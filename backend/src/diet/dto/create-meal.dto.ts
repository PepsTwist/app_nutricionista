// backend/src/diet/dto/create-meal.dto.ts

import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealItemDto } from './create-meal-item.dto'; // Verifique se o nome e o caminho deste arquivo estão corretos no seu projeto

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  /**
   * O dia da semana para esta refeição.
   * Ex: "Segunda-feira", "Terça-feira", etc.
   */
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items: CreateMealItemDto[];
}
