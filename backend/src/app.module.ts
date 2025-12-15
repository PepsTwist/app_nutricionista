// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DietModule } from './diet/diet.module';
import { AnamnesisModule } from './anamnesis/anamnesis.module';
import { WeightRecordsModule } from './weight-records/weight-records.module';

// --- IMPORTAÇÃO DE TODAS AS ENTIDADES ---
import { User } from './users/user.entity';
import { Patient } from './patients/patient.entity';
import { DietPlan } from './diet/diet-plan.entity';
import { Meal } from './diet/meal.entity';
import { MealItem } from './diet/meal-item.entity';
import { Anamnesis } from './anamnesis/anamnesis.entity';
import { WeightRecord } from './weight-records/weight-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: parseInt(configService.get<string>('POSTGRES_PORT', '5432')),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        // --- A LISTA COMPLETA E DEFINITIVA DE ENTIDADES ---
        entities: [
          User,
          Patient,
          Anamnesis, // Colocando Anamnesis depois de Patient
          DietPlan,
          Meal,
          MealItem,
          WeightRecord,
        ],
        synchronize: true, // synchronize:true é o que tenta criar as tabelas
      }),
    }),
    // Importa todos os módulos da aplicação
    AuthModule,
    UsersModule,
    PatientsModule,
    DietModule,
    AnamnesisModule,
    WeightRecordsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
