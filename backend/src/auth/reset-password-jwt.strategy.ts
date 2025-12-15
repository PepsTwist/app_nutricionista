// backend/src/auth/reset-password-jwt.strategy.ts

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
export class ResetPasswordJwtStrategy extends PassportStrategy(
  Strategy,
  'reset-password-jwt',
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

  async validate(payload: { id: string; action: string }): Promise<Patient> {
    if (payload.action !== 'reset_password') {
      throw new UnauthorizedException('Token inválido para esta ação.');
    }

    const { id } = payload;
    const patient = await this.patientsRepository.findOneBy({ id });

    if (!patient) {
      throw new UnauthorizedException(
        'Paciente não encontrado ou token inválido.',
      );
    }

    return patient;
  }
}
