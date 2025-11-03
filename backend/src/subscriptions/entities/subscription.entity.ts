import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: 'free_trial' })
  tier: string;

  @CreateDateColumn()
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;
}
