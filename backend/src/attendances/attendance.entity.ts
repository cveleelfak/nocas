import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Party } from '../parties/party.entity';
import { User } from '../users/user.entity';

@Entity('attendances')
@Unique(['user', 'party'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Party, (party) => party.attendances, { onDelete: 'CASCADE' })
  party!: Party;

  @CreateDateColumn()
  createdAt!: Date;
}