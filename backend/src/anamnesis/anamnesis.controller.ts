// backend/src/anamnesis/anamnesis.controller.ts

import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnamnesisService } from './anamnesis.service';
// --- CORREÇÃO 1: Usando o nome correto do DTO e do arquivo ---
import { CreateAnamnesisDto } from './dto/create-or-update-anamnesis.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('anamnesis')
@UseGuards(AuthGuard('jwt')) // Protege todas as rotas com a guarda do nutricionista
export class AnamnesisController {
  constructor(private readonly anamnesisService: AnamnesisService) {}

  @Post(':patientId')
  createOrUpdate(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body(new ValidationPipe()) dto: CreateAnamnesisDto,
    @GetUser() user: User, // Obtém o nutricionista logado
  ) {
    // --- CORREÇÃO 2: Passando todos os 3 argumentos para o serviço ---
    return this.anamnesisService.createOrUpdate(patientId, dto, user);
  }

  @Get(':patientId')
  findByPatientId(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @GetUser() user: User, // Obtém o nutricionista logado
  ) {
    return this.anamnesisService.findByPatientId(patientId, user);
  }
}
