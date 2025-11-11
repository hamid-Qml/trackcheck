import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AudioUpload } from './audio-upload.entity';
// src/audio/entities/audio-feature.entity.ts
@Entity('audio_features')
export class AudioFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => AudioUpload, { onDelete: 'CASCADE' })
  @JoinColumn()
  upload: AudioUpload;

  // Basic
  @Column('float', { nullable: true }) tempo: number;
  @Column({ nullable: true }) key: string;
  @Column('float', { nullable: true }) duration: number;
  @Column('float', { nullable: true }) peak_rms: number;

  // Spectral
  @Column('float', { nullable: true }) spectral_centroid: number;
  @Column('float', { nullable: true }) spectral_rolloff: number;
  @Column('float', { nullable: true }) bandwidth: number;
  @Column('float', { nullable: true }) flatness: number;

  // Dynamics
  @Column('jsonb', { nullable: true }) energy_profile: any;
  @Column('jsonb', { nullable: true }) transients_info: any;
  @Column('jsonb', { nullable: true }) silence_segments: any;          

  // Vocals
  @Column('jsonb', { nullable: true }) vocal_timestamps: any;
  @Column('float', { nullable: true }) vocal_intensity: number;        

  // Structure
  @Column('jsonb', { nullable: true }) drop_timestamps: any;
  @Column('jsonb', { nullable: true }) structure: any;
  @Column('jsonb', { nullable: true }) structure_segments: any;        

  // FX
  @Column('jsonb', { nullable: true }) fx_and_transitions: any;

  // Optional snapshot for front-end preview
  @Column('jsonb', { nullable: true }) summary_snapshot: any;          

  // Flag for reference vs main track
  @Column({ default: false }) is_reference: boolean;                   

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  extracted_at: Date;
}
