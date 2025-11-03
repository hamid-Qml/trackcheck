import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { AudioUpload } from '../../audio/entities/audio-upload.entity';

@Entity('ai_feedback')
@Unique(['upload']) // ensure one feedback per main upload
export class AiFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Main track this feedback is for (1:1)
  @OneToOne(() => AudioUpload, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_id' })
  upload: AudioUpload;

  // Optional: the reference track used to inform this feedback (N:1 to uploads)
  @ManyToOne(() => AudioUpload, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reference_upload_id' })
  reference_upload?: AudioUpload | null;

  // === Scores ===
  @Column('int', { nullable: true }) mix_quality_score: number | null;
  @Column('int', { nullable: true }) arrangement_score: number | null;
  @Column('int', { nullable: true }) creativity_score: number | null;
  @Column('int', { nullable: true }) suggestions_score: number | null;

  // === Section Text ===
  @Column('text', { nullable: true }) mix_quality_text: string | null;
  @Column('text', { nullable: true }) arrangement_text: string | null;
  @Column('text', { nullable: true }) creativity_text: string | null;
  @Column('text', { nullable: true }) suggestions_text: string | null;

  // Aggregated bullets per section (keep as-is)
  @Column('jsonb', { nullable: true }) recommendations: any;

  // Optional: summary comparing main vs reference (AI-produced)
  @Column('text', { nullable: true })
  reference_track_summary: string | null;

  // Raw model output for debugging/traceability
  @Column('text', { nullable: true }) raw_response: string | null;

  @Column({ default: 'gpt-4o' })
  model: string;

  @CreateDateColumn()
  created_at: Date;
}
