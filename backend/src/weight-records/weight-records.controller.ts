// backend/src/weight-records/weight-records.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { AuthGuard } from '@nestjs/passport';
import { GetPatient } from '../auth/decorators/get-patient.decorator';
import { Patient } from '../patients/patient.entity';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';

@Controller('weight-records')
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  // Criar novo registro de peso (paciente logado)
  @Post()
  @UseGuards(AuthGuard('patient-jwt'))
  create(
    @Body(new ValidationPipe()) createDto: CreateWeightRecordDto,
    @GetPatient() patient: Patient,
  ) {
    return this.weightRecordsService.create(createDto, patient);
  }

  // Listar todos os registros de um paciente (paciente ou nutricionista)
  @Get(':patientId')
  @UseGuards(AuthGuard(['jwt', 'patient-jwt']))
  findAllForPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.weightRecordsService.findAllForPatient(patientId);
  }

  // Remover registro de peso (apenas paciente logado)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('patient-jwt'))
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetPatient() patient: Patient,
  ) {
    return this.weightRecordsService.remove(id, patient.id);
  }
}
