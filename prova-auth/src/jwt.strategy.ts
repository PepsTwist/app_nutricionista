// src/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config'; // 1. Importe o ConfigService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 2. Injete o ConfigService e o repositório no construtor
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private configService: ConfigService, // Injeção do ConfigService
  ) {
    // 3. Chame super() com o objeto de configuração
    super({
      // Busca a chave secreta do nosso arquivo .env de forma segura
      // A exclamação (!) no final diz ao TypeScript: "Eu garanto que esta variável não será nula ou indefinida".
      // Isso satisfaz a verificação de tipo.
      secretOrKey: configService.get<string>('JWT_SECRET')!, // <-- A CORREÇÃO ESTÁ AQUI
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
