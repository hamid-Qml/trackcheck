import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audio_uploads')
export class AudioUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column() file_path: string;
  @Column() filename: string;
  @Column('float', { nullable: true }) duration: number;
  @Column('float', { nullable: true }) size_mb: number;
  @Column({ nullable: true }) genre: string;
  @Column({ nullable: true }) feedback_focus: string;

  @Column({ default: 'uploaded' })
  status: string; // uploaded | processed | failed

  @CreateDateColumn()
  created_at: Date;
}
