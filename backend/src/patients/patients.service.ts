import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  /**
   * Hasheia uma senha em texto plano.
   * @param password A senha a ser hasheada.
   * @returns A senha hasheada.
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * Cria um novo paciente associado a um nutricionista.
   * @param createPatientDto Os dados do novo paciente.
   * @param user O nutricionista (usuário) logado.
   * @returns O paciente criado.
   */
  async create(
    createPatientDto: CreatePatientDto,
    user: User,
  ): Promise<Patient> {
    const { email, password } = createPatientDto;

    const existingPatient = await this.findOneByEmail(email);
    if (existingPatient) {
      throw new ConflictException(
        'O e-mail fornecido para o paciente já está em uso.',
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const newPatient = this.patientsRepository.create({
      ...createPatientDto,
      password: hashedPassword,
      nutritionist: user,
      status: 'PASSWORD_RESET_REQUIRED', // Define o status inicial
    });

    return this.patientsRepository.save(newPatient);
  }

  /**
   * Encontra todos os pacientes de um nutricionista específico.
   * @param nutritionistId O ID do nutricionista.
   * @returns Uma lista de pacientes.
   */
  async findAllForNutritionist(nutritionistId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { nutritionist: { id: nutritionistId } },
      order: { fullName: 'ASC' },
    });
  }

  /**
   * Encontra um paciente específico pelo ID, garantindo que ele pertença ao nutricionista logado.
   * @param id O ID do paciente a ser encontrado.
   * @param user O nutricionista logado.
   * @returns O paciente encontrado com suas relações.
   */
  async findOneByIdForNutritionist(id: string, user: User): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id, nutritionist: { id: user.id } },
      relations: ['dietPlans', 'anamnesis', 'weightRecords'],
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID "${id}" não encontrado ou não pertence a você.`,
      );
    }
    return patient;
  }

  /**
   * Encontra um paciente pelo e-mail.
   * @param email O e-mail do paciente.
   * @returns O paciente encontrado ou nulo.
   */
  async findOneByEmail(email: string): Promise<Patient | null> {
    return this.patientsRepository.findOneBy({ email });
  }

  /**
   * Atualiza os dados de um paciente.
   * @param id O ID do paciente a ser atualizado.
   * @param updatePatientDto Os dados a serem atualizados.
   * @param user O nutricionista logado.
   * @returns O paciente atualizado.
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    user: User,
  ): Promise<Patient> {
    const patient = await this.findOneByIdForNutritionist(id, user);

    if (updatePatientDto.password) {
      updatePatientDto.password = await this.hashPassword(
        updatePatientDto.password,
      );
    }

    const updatedPatient = this.patientsRepository.merge(
      patient,
      updatePatientDto,
    );
    return this.patientsRepository.save(updatedPatient);
  }

  /**
   * Remove um paciente.
   * @param id O ID do paciente a ser removido.
   * @param user O nutricionista logado.
   */
  async remove(id: string, user: User): Promise<void> {
    const patient = await this.findOneByIdForNutritionist(id, user);
    const result = await this.patientsRepository.delete(patient.id);

    if (result.affected === 0) {
      throw new NotFoundException(`Paciente com ID "${id}" não encontrado.`);
    }
  }

  /**
   * Redefine a senha de um paciente e ativa sua conta.
   * @param patientId O ID do paciente.
   * @param resetPasswordDto O DTO contendo a nova senha.
   */
  async resetPassword(
    patientId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const { newPassword } = resetPasswordDto;

    const hashedPassword = await this.hashPassword(newPassword);

    await this.patientsRepository.update(patientId, {
      password: hashedPassword,
      status: 'ACTIVE',
    });
  }
}
