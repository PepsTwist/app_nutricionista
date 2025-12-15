// backend/src/anamnesis/anamnesis.module.ts

import { Module } from '@nestjs/common';
import { AnamnesisService } from './anamnesis.service';
import { AnamnesisController } from './anamnesis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anamnesis } from './anamnesis.entity';
import { Patient } from 'src/patients/patient.entity';

@Module({
  // A declaração TypeOrmModule.forFeature foi movida para o AppModule
  // para garantir a ordem de carregamento correta.
  // No entanto, para que o serviço possa injetar os repositórios,
  // eles precisam ser fornecidos neste contexto.
  imports: [TypeOrmModule.forFeature([Anamnesis, Patient])],
  controllers: [AnamnesisController],
  providers: [AnamnesisService],
})
export class AnamnesisModule {}
