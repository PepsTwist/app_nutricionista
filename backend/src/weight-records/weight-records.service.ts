// backend/src/weight-records/weight-records.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeightRecord } from './weight-record.entity';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class WeightRecordsService {
  constructor(
    @InjectRepository(WeightRecord)
    private weightRecordsRepository: Repository<WeightRecord>,
  ) {}

  // Cria um novo registro de peso para o paciente logado
  async create(
    createDto: CreateWeightRecordDto,
    patient: Patient,
  ): Promise<WeightRecord> {
    const newRecord = this.weightRecordsRepository.create({
      ...createDto,
      patient, // Associa o registro ao paciente que fez a requisição
    });
    return this.weightRecordsRepository.save(newRecord);
  }

  // Busca todos os registros de peso de um paciente específico
  async findAllForPatient(patientId: string): Promise<WeightRecord[]> {
    return this.weightRecordsRepository.find({
      where: {
        patient: { id: patientId },
      },
      order: {
        recordDate: 'ASC', // Ordena da data mais antiga para a mais nova
      },
    });
  }

  // Remove um registro de peso do paciente
  async remove(recordId: string, patientId: string): Promise<void> {
    const result = await this.weightRecordsRepository.delete({
      id: recordId,
      patient: { id: patientId }, // Garante que o registro pertence ao paciente
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Registro de peso com ID "${recordId}" não encontrado para este paciente.`,
      );
    }
  }
}
