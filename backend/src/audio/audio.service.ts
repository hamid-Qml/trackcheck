// src/audio/audio.service.ts
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomBytes } from 'node:crypto';
import { AudioUpload } from './entities/audio-upload.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UpdateUploadDto } from './dto/audio.dto';
import { AudioFeature } from './entities/audio-feature.entity';

@Injectable()
export class AudioService {
  private readonly UPLOADS_DIR: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(AudioUpload) private readonly uploads: Repository<AudioUpload>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AudioFeature) private readonly features: Repository<AudioFeature>,
  ) {
    this.UPLOADS_DIR = this.config.get<string>('UPLOADS_DIR', path.resolve(process.cwd(), 'uploads'));
    if (!fs.existsSync(this.UPLOADS_DIR)) fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
  }

  // List uploads for current user
  findAllUploads(userId: string) {
    return this.uploads.find({ where: { user: { id: userId } }, relations: ['user'], order: { created_at: 'DESC' } });
  }

  async findUploadOwned(id: string, userId: string) {
    const row = await this.uploads.findOne({ where: { id }, relations: ['user'] });
    if (!row) throw new NotFoundException('Upload not found');
    if (row.user.id !== userId) throw new ForbiddenException();
    return row;
  }

  async createUploadFromFile(userId: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('audio_file is required');
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const ext = path.extname(file.originalname || '') || '.bin';
    const name = `${Date.now()}_${randomBytes(6).toString('hex')}${ext}`;
    const dest = path.join(this.UPLOADS_DIR, name);
    await fs.promises.writeFile(dest, file.buffer);

    const sizeMb = file.size ? +(file.size / (1024 * 1024)).toFixed(3) : null;
    const created = this.uploads.create({
      user,
      file_path: dest,
      filename: path.basename(dest),
      size_mb: sizeMb ?? undefined,
      status: 'uploaded',
    } as Partial<AudioUpload>);
    const saved = await this.uploads.save(created);

    return {
      id: saved.id,
      filename: saved.filename,
      file_path: saved.file_path,
      size_mb: saved.size_mb ?? null,
      status: saved.status,
      created_at: saved.created_at,
    };
  }

  async updateUploadOwned(id: string, userId: string, dto: UpdateUploadDto) {
    const row = await this.findUploadOwned(id, userId);
    Object.assign(row, {
      duration: dto.duration ?? row.duration,
      genre: dto.genre ?? row.genre,
      feedback_focus: dto.feedback_focus ?? row.feedback_focus,
    });
    await this.uploads.save(row);
    return row;
  }

  async removeUploadOwned(id: string, userId: string) {
    const row = await this.findUploadOwned(id, userId);
    await this.uploads.delete(row.id);
    return { ok: true };
  }

  findAllFeatures(userId: string) {
    // return only features for this user's uploads
    return this.features.find({
      where: { upload: { user: { id: userId } } },
      relations: ['upload', 'upload.user'],
      order: { extracted_at: 'DESC' as any },
    });
  }
}
