import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from './role.enum';
import { Venue } from '../venues/venue.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Venue, (venue) => venue.owner)
  venues!: Venue[];
}