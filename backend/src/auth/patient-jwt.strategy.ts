// backend/src/auth/patient-jwt.strategy.ts

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/patients/patient.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientJwtStrategy extends PassportStrategy(
  Strategy,
  'patient-jwt',
) {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new InternalServerErrorException(
        'A chave secreta JWT não foi definida no ambiente.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: { id: string; userType: string }): Promise<Patient> {
    if (payload.userType !== 'patient') {
      throw new UnauthorizedException(
        'Token inválido para este tipo de acesso.',
      );
    }

    const { id } = payload;
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: [
        'dietPlans',
        'dietPlans.meals',
        'dietPlans.meals.items',
        'weightRecords',
      ],
    });

    if (!patient) {
      throw new UnauthorizedException(
        'Paciente não encontrado ou token inválido.',
      );
    }

    return patient;
  }
}
