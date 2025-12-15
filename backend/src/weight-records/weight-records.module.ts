// backend/src/weight-records/weight-records.module.ts

import { Module } from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { WeightRecordsController } from './weight-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightRecord } from './weight-record.entity';
import { AuthModule } from 'src/auth/auth.module'; // Este caminho está correto

@Module({
  imports: [TypeOrmModule.forFeature([WeightRecord]), AuthModule],
  controllers: [WeightRecordsController],
  providers: [WeightRecordsService],
})
export class WeightRecordsModule {}
