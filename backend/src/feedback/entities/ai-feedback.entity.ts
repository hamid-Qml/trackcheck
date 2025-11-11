import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { AudioUpload } from '../../audio/entities/audio-upload.entity';

@Entity('ai_feedback')
@Unique(['upload'])
export class AiFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Main upload this feedback applies to */
  @OneToOne(() => AudioUpload, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_id' })
  upload: AudioUpload;

  /** Optional reference upload used for comparison */
  @ManyToOne(() => AudioUpload, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reference_upload_id' })
  reference_upload?: AudioUpload | null;

  // === Core Scoring ===
  @Column('int', { nullable: true }) mix_quality_score: number | null;
  @Column('int', { nullable: true }) arrangement_score: number | null;
  @Column('int', { nullable: true }) creativity_score: number | null;
  @Column('int', { nullable: true }) suggestions_score: number | null;

  // === Section Details ===
  @Column('text', { nullable: true }) mix_quality_text: string | null;
  @Column('text', { nullable: true }) arrangement_text: string | null;
  @Column('text', { nullable: true }) creativity_text: string | null;
  @Column('text', { nullable: true }) suggestions_text: string | null;

  // === Aggregate & Comparison ===
  @Column('jsonb', { nullable: true }) recommendations: any;
  @Column('jsonb', { nullable: true }) reference_comparison_json: any;
  @Column('text', { nullable: true }) reference_track_summary: string | null;

  // === Model Trace ===
  @Column({ type: 'text', default: 'gpt-4o' }) model: string;
  @Column('jsonb', { nullable: true }) llm_usage: any;
  @Column('varchar', { length: 50, nullable: true }) prompt_version: string | null;
  @Column('text', { nullable: true }) raw_response: string | null;

  // === Status / Error ===
  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: 'completed' | 'failed' | 'partial' | 'recomputed';
  @Column('text', { nullable: true }) error_message: string | null;

  // === Audit ===
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
