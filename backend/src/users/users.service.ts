import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: { email: string; password: string }) {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ email: dto.email, password_hash });
    return this.repo.save(user);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
