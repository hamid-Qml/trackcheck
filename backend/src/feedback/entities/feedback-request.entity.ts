// src/feedback/entities/feedback-request.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AudioUpload } from '../../audio/entities/audio-upload.entity';

export type FeedbackProgress = {
  percent: number;          // 0..100
  stage: string;            // e.g. 'received' | 'extracting_main' | 'comparing' | 'prompting' | 'completed'
  status?: string;          // 'processing' | 'completed' | 'failed'
  meta?: Record<string, any>;
};

@Entity('feedback_requests')
export class FeedbackRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => AudioUpload, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_id' })
  upload: AudioUpload;

  @ManyToOne(() => AudioUpload, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reference_upload_id' })
  reference_upload: AudioUpload | null;

  /** Job status */
  @Column({ default: 'pending' })
  status: 'pending' | 'extracting' | 'prompting' | 'completed' | 'failed';

  @Column({ nullable: true, type: 'text'})
  error_message: string;

  /** Input selections */
  @Column({ nullable: true, type: 'text' })
  feedback_focus: string | null;

  @Column({ nullable: true, type: 'text' })
  genre: string | null;

  @Column({ nullable: true, type: 'text' })
  user_note: string | null;

  /** Progress payload updated by MLint via callback */
  @Column('jsonb', { nullable: true, default: () => "'{}'::jsonb" })
  progress: FeedbackProgress;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
