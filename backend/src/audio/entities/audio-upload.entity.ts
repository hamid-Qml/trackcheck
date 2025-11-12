// src/audio/entities/audio_upload.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Represents a single audio file uploaded by a user.
 *
 * Each upload belongs to one user and stores basic metadata such as
 * the original filename, stored file path (relative to UPLOADS_DIR),
 * file size, and current processing status.
 */
@Entity('audio_uploads')
export class AudioUpload {
  /**
   * Unique identifier for the upload (UUID v4).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The user who uploaded this audio file.
   *
   * - Relation: Many uploads can belong to one user.
   * - When the user is deleted, all their uploads are also deleted.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * The relative path of the uploaded file on disk.
   * Example: `user_42/2025_03_14_a12b3c.wav`
   */
  @Column()
  file_path: string;

  /**
   * The original filename provided by the user during upload.
   * Example: `MySong.wav`
   */
  @Column({nullable: true})
  original_file_name: string;

  /**
   * Approximate file size in megabytes (MB).
   */
  @Column('float', { nullable: true })
  size_mb: number | null;

  /**
   * Current upload or processing status.
   *
   * - `uploaded`: File successfully stored but not processed yet.
   * - `processed`: File analyzed or used in a feedback request.
   * - `failed`: Upload or processing failed.
   */
  @Column({ default: 'uploaded' })
  status: 'uploaded' | 'processed' | 'failed';

  /**
   * The timestamp when this record was created.
   * Automatically set by the database.
   */
  @CreateDateColumn()
  created_at: Date;
}
