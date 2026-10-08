import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus } from '../common/approval-status.enum';
import { Party } from '../parties/party.entity';
import { User } from '../users/user.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column('double precision')
  latitude!: number;

  @Column('double precision')
  longitude!: number;

  @Column('int')
  capacity!: number;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @ManyToOne(() => User, (user) => user.venues, { onDelete: 'CASCADE' })
  owner!: User;

  @OneToMany(() => Party, (party) => party.venue)
  parties!: Party[];
}