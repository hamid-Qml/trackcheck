import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioUpload } from './entities/audio-upload.entity';
import { AudioFeature } from './entities/audio-feature.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(AudioUpload) private readonly uploads: Repository<AudioUpload>,
    @InjectRepository(AudioFeature) private readonly features: Repository<AudioFeature>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findAllUploads() {
    return this.uploads.find({ relations: ['user'] });
  }

  async findUpload(id: string) {
    const item = await this.uploads.findOne({ where: { id }, relations: ['user'] });
    if (!item) throw new NotFoundException('Upload not found');
    return item;
  }

  async createUpload(dto: {
    userId: string;
    file_path: string;
    filename: string;
    duration?: number;
    size_mb?: number;
    genre?: string;
    feedback_focus?: string;
  }) {
    const user = await this.users.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const upload = this.uploads.create({
      file_path: dto.file_path,
      filename: dto.filename,
      duration: dto.duration ?? null,
      size_mb: dto.size_mb ?? null,
      genre: dto.genre ?? null,
      feedback_focus: dto.feedback_focus ?? null,
      status: 'uploaded',
    } as Partial<AudioUpload>);
    upload.user = user;
    return this.uploads.save(upload);
  }

  async removeUpload(id: string) {
    await this.uploads.delete(id);
    return { ok: true };
  }

  findAllFeatures() {
    return this.features.find({ relations: ['upload'] });
  }
}
