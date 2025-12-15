import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(body: any): Promise<any> {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(body.password, salt);
    const user = this.usersRepository.create({ email: body.email, password });
    await this.usersRepository.save(user);
    const { password: _, ...result } = user;
    return result;
  }

  async login(body: any): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email: body.email },
    });
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  getProfile(user: User): User {
    return user;
  }
}
