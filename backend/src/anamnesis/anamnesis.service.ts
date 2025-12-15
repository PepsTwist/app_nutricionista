// backend/src/anamnesis/anamnesis.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnesis } from './anamnesis.entity';
import { CreateAnamnesisDto } from './dto/create-or-update-anamnesis.dto';
import { Patient } from 'src/patients/patient.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class AnamnesisService {
  constructor(
    @InjectRepository(Anamnesis)
    private anamnesisRepository: Repository<Anamnesis>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async createOrUpdate(
    patientId: string,
    dto: CreateAnamnesisDto,
    user: User,
  ): Promise<Anamnesis> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['nutritionist', 'anamnesis'],
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID "${patientId}" não encontrado.`,
      );
    }

    if (patient.nutritionist.id !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este paciente.',
      );
    }

    let anamnesis = patient.anamnesis;
    if (!anamnesis) {
      anamnesis = this.anamnesisRepository.create({ patient });
    }

    // --- CORREÇÃO: Usando os nomes de campo corretos e sincronizados ---
    anamnesis.mainComplaint = dto.mainComplaint ?? anamnesis.mainComplaint;
    anamnesis.historyOfCurrentIllness =
      dto.historyOfCurrentIllness ?? anamnesis.historyOfCurrentIllness;
    anamnesis.pastMedicalHistory =
      dto.pastMedicalHistory ?? anamnesis.pastMedicalHistory;
    anamnesis.familyHistory = dto.familyHistory ?? anamnesis.familyHistory;
    anamnesis.lifestyle = dto.lifestyle ?? anamnesis.lifestyle;
    anamnesis.dietaryHistory = dto.dietaryHistory ?? anamnesis.dietaryHistory;

    return this.anamnesisRepository.save(anamnesis);
  }

  async findByPatientId(patientId: string, user: User): Promise<Anamnesis> {
    const anamnesis = await this.anamnesisRepository.findOne({
      where: { patient: { id: patientId } },
      relations: ['patient', 'patient.nutritionist'],
    });

    if (!anamnesis) {
      throw new NotFoundException(
        `Anamnese para o paciente com ID "${patientId}" não encontrada.`,
      );
    }

    if (anamnesis.patient.nutritionist.id !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta anamnese.',
      );
    }

    return anamnesis;
  }
}
