// backend/src/weight-records/dto/create-weight-record.dto.ts

import { IsNumber, IsDateString, IsPositive } from 'class-validator';

export class CreateWeightRecordDto {
  @IsNumber()
  @IsPositive()
  weight: number;

  @IsDateString()
  recordDate: string; // Recebemos como string no formato 'AAAA-MM-DD'
}
