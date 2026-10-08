import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from '../parties/party.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => Party, (party) => party.genres)
  parties!: Party[];
}