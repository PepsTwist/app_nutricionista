// backend/src/auth/jwt.strategy.ts

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    // Garante que a aplicação não inicia sem a chave secreta
    if (!secret) {
      throw new InternalServerErrorException(
        'A chave secreta JWT não foi definida no ambiente.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret, // Agora 'secret' tem garantia de ser uma string
    });
  }

  async validate(payload: { id: string; userType: string }): Promise<User> {
    if (payload.userType !== 'nutritionist') {
      throw new UnauthorizedException(
        'Token inválido para este tipo de acesso.',
      );
    }

    const { id } = payload;
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado ou token inválido.',
      );
    }

    return user;
  }
}
