// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PatientJwtStrategy } from './patient-jwt.strategy';
import { ResetPasswordJwtStrategy } from './reset-password-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Patient } from 'src/patients/patient.entity';

// --- IMPORTAÇÃO DO NOVO GUARD ---
import { PatientJwtAuthGuard } from './patient-jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([User, Patient]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PatientJwtStrategy,
    ResetPasswordJwtStrategy,
    PatientJwtAuthGuard, // <-- ADICIONE O GUARD À LISTA DE PROVIDERS
  ],
  // Seus exports permanecem como estão, não precisamos adicionar o guard aqui
  // a menos que outro módulo precise injetá-lo diretamente, o que é raro.
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
