// backend/src/anamnesis/dto/create-anamnesis.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class CreateAnamnesisDto {
  // --- CORREÇÃO: Usando os mesmos nomes de campo da entidade ---
  @IsString()
  @IsOptional()
  mainComplaint?: string;

  @IsString()
  @IsOptional()
  historyOfCurrentIllness?: string;

  @IsString()
  @IsOptional()
  pastMedicalHistory?: string;

  @IsString()
  @IsOptional()
  familyHistory?: string;

  @IsString()
  @IsOptional()
  lifestyle?: string;

  @IsString()
  @IsOptional()
  dietaryHistory?: string;
}
