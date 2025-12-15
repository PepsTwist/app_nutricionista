// backend/src/auth/decorators/get-patient.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Patient } from 'src/patients/patient.entity';

export const GetPatient = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Patient => {
    const request = ctx.switchToHttp().getRequest();
    // A estratégia 'patient-jwt' anexa o objeto 'patient' na requisição
    return request.user as Patient;
  },
);
