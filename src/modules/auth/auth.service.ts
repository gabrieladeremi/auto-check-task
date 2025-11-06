import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) throw new BadRequestException('Email already registered');

    const user = await this.usersService.create(dto);

    const token: string = this.signToken(user);

    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token: string = this.signToken(user);

    return { user, token };
  }

  private signToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return this.jwtService.sign(payload);
  }
}
