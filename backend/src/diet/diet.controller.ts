// backend/src/diet/diet.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DietService } from './diet.service';
import { CreateDietPlanDto } from './dto/create-diet-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { UpdateDietPlanDto } from './dto/update-diet-plan.dto';
import { PatientJwtAuthGuard } from 'src/auth/patient-jwt-auth.guard';
import { GetPatient } from 'src/auth/decorators/get-patient.decorator';
import { Patient } from 'src/patients/patient.entity';

@Controller('diet')
export class DietController {
  constructor(private readonly dietService: DietService) {}

  // --- ROTAS PARA O PACIENTE ---

  @Get('my-plans')
  @UseGuards(PatientJwtAuthGuard)
  findMyPlans(@GetPatient() patient: Patient) {
    return this.dietService.findAllMyPlans(patient.id);
  }

  @Get('my-plan/:planId')
  @UseGuards(PatientJwtAuthGuard)
  findOneForPatient(
    @Param('planId', ParseUUIDPipe) planId: string,
    @GetPatient() patient: Patient,
  ) {
    // CORREÇÃO: Esta chamada agora corresponde a um método que existe no serviço
    return this.dietService.findOneForPatient(planId, patient.id);
  }

  // --- ROTAS PARA O NUTRICIONISTA ---

  @Post('plan')
  @UseGuards(AuthGuard())
  create(
    @Body() createDietPlanDto: CreateDietPlanDto,
    @GetUser() nutritionist: User,
  ) {
    return this.dietService.create(createDietPlanDto, nutritionist);
  }

  @Patch('plan/:planId')
  @UseGuards(AuthGuard())
  update(
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() updateDietPlanDto: UpdateDietPlanDto,
    @GetUser() nutritionist: User,
  ) {
    return this.dietService.update(planId, updateDietPlanDto, nutritionist.id);
  }

  @Get('plan/:planId')
  @UseGuards(AuthGuard())
  findOne(
    @Param('planId', ParseUUIDPipe) planId: string,
    @GetUser() nutritionist: User,
  ) {
    return this.dietService.findOneById(planId, nutritionist.id);
  }

  @Get('plans/by-patient/:patientId')
  @UseGuards(AuthGuard())
  findAllForPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @GetUser() nutritionist: User,
  ) {
    return this.dietService.findAllForPatient(patientId, nutritionist.id);
  }

  @Delete('plan/:planId')
  @UseGuards(AuthGuard())
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('planId', ParseUUIDPipe) planId: string,
    @GetUser() nutritionist: User,
  ) {
    return this.dietService.remove(planId, nutritionist.id);
  }
}
