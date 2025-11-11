// src/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('users_email_unique', { unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', nullable: true, default: null })
  full_name: string | null; 

  @Exclude()
  @Column({ type: 'text' })
  password_hash: string;

  @Exclude()
  @Column({ type: 'text', nullable: true, default: null })
  password_reset_token_hash: string | null; 

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  password_reset_token_expires_at: Date | null; 

  @OneToMany(() => Subscription, (s) => s.user)
  subscriptions: Subscription[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
