import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async signup(dto: { email: string; password: string }) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({ email: dto.email, password_hash });
    await this.users.save(user);
    // Return minimal shape for now (swap with JWT later)
    return { user: { id: user.id, email: user.email } };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    // Return mock token placeholder (replace with real JWT later)
    return { token: 'dev-token', user: { id: user.id, email: user.email } };
  }
}
