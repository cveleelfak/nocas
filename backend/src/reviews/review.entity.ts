import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Venue } from '../venues/venue.entity';

@Entity('reviews')
@Unique(['user', 'venue'])
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  rating!: number;

  @Column({ type: 'text', default: '' })
  comment!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  venue!: Venue;

  @CreateDateColumn()
  createdAt!: Date;
}