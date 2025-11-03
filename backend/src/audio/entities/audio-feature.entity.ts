import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AudioUpload } from './audio-upload.entity';

@Entity('audio_features')
export class AudioFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => AudioUpload, { onDelete: 'CASCADE' })
  @JoinColumn()
  upload: AudioUpload;

  @Column('float', { nullable: true }) tempo: number;
  @Column({ nullable: true }) key: string;
  @Column('float', { nullable: true }) peak_rms: number;
  @Column('float', { nullable: true }) spectral_centroid: number;
  @Column('float', { nullable: true }) spectral_rolloff: number;
  @Column('float', { nullable: true }) bandwidth: number;
  @Column('float', { nullable: true }) flatness: number;
  @Column('jsonb', { nullable: true }) energy_profile: any;
  @Column('jsonb', { nullable: true }) transients_info: any;
  @Column('jsonb', { nullable: true }) vocal_timestamps: any;
  @Column('jsonb', { nullable: true }) drop_timestamps: any;
  @Column('jsonb', { nullable: true }) fx_and_transitions: any;
  @Column('jsonb', { nullable: true }) structure: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  extracted_at: Date;
}
