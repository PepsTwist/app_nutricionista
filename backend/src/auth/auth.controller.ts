// backend/src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { GetPatient } from './decorators/get-patient.decorator'; // Importa o decorador existente
import { Patient } from 'src/patients/patient.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: User) {
    return user;
  }

  // --- NOVA ROTA PARA O PACIENTE ---
  @Get('/me')
  @UseGuards(AuthGuard('patient-jwt')) // Protege com a estratégia de paciente
  getPatientProfile(@GetPatient() patient: Patient) {
    // O @GetPatient extrai o paciente que a PatientJwtStrategy anexou à requisição
    return patient;
  }
}
