// backend/src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Patient } from 'src/patients/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tenta login de Nutricionista
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        id: user.id,
        email: user.email,
        userType: 'nutritionist',
      };
      return { access_token: this.jwtService.sign(payload) };
    }

    // Tenta login de Paciente
    const patient = await this.patientsRepository.findOneBy({ email });
    if (patient && (await bcrypt.compare(password, patient.password))) {
      if (patient.status === 'PASSWORD_RESET_REQUIRED') {
        // --- CORREÇÃO: Gerando o payload que a sua estratégia espera ---
        const resetPayload = {
          id: patient.id,
          action: 'reset_password', // O campo que sua estratégia valida
        };
        const resetToken = this.jwtService.sign(resetPayload, {
          expiresIn: '15m',
        });

        return {
          statusCode: 403,
          message: 'Password reset required',
          reset_token: resetToken,
          email: patient.email,
        };
      }

      const payload = {
        id: patient.id,
        email: patient.email,
        userType: 'patient',
      };
      return { access_token: this.jwtService.sign(payload) };
    }

    throw new UnauthorizedException('Credenciais inválidas.');
  }
}
