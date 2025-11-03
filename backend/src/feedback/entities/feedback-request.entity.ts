import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AudioUpload } from '../../audio/entities/audio-upload.entity';

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

  @Column({ default: 'pending' })
  status: string; // pending | extracting | prompting | completed | failed

  @Column({ nullable: true })
  error_message: string;

  @Column({ nullable: true })
  feedback_focus: string;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true, type: 'text' })
  user_note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
