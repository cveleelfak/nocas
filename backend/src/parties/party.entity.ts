import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApprovalStatus } from '../common/approval-status.enum';
import { Genre } from '../genres/genre.entity';
import { Venue } from '../venues/venue.entity';
import { Attendance } from '../attendances/attendance.entity';


@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'timestamptz' })
  startsAt!: Date;

  @Column('int', { default: 0 })
  price!: number;

  @Column({ default: '' })
  performers!: string;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @ManyToOne(() => Venue, (venue) => venue.parties, { onDelete: 'CASCADE' })
  venue!: Venue;

  @ManyToMany(() => Genre, (genre) => genre.parties)
  @JoinTable({ name: 'party_genres' })
  genres!: Genre[];

  @OneToMany(() => Attendance, (attendance) => attendance.party)
  attendances!: Attendance[];

  attendeeCount?: number;

  @CreateDateColumn()
  createdAt!: Date;
}