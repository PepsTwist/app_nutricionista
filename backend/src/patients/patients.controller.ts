// backend/src/patients/patients.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { GetPatient } from 'src/auth/decorators/get-patient.decorator';
import { Patient } from './patient.entity';
// --- CORREÇÃO 1: Importando o DTO com o nome e do arquivo correto ---
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(new ValidationPipe()) createPatientDto: CreatePatientDto,
    @GetUser() user: User,
  ) {
    return this.patientsService.create(createPatientDto, user);
  }

  @Patch('me/reset-password')
  @UseGuards(AuthGuard('reset-password-jwt'))
  resetMyPassword(
    @GetPatient() patient: Patient,
    // Usa o DTO correto
    @Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto,
  ) {
    // --- CORREÇÃO 2: Chamando o método com o nome correto no serviço ---
    return this.patientsService.resetPassword(patient.id, resetPasswordDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@GetUser() user: User) {
    return this.patientsService.findAllForNutritionist(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.patientsService.findOneByIdForNutritionist(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe()) updatePatientDto: UpdatePatientDto,
    @GetUser() user: User,
  ) {
    return this.patientsService.update(id, updatePatientDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.patientsService.remove(id, user);
  }
}
