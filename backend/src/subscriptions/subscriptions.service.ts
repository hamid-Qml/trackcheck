import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private readonly repo: Repository<Subscription>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const sub = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async create(dto: { userId: string; tier?: string }) {
    const user = await this.users.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    const sub = this.repo.create({ user, tier: dto.tier ?? 'free_trial' });
    return this.repo.save(sub);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
