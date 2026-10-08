import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from './role.enum';
import { User } from './user.entity';

type NewUser = Pick<User, 'email' | 'passwordHash' | 'name' | 'role'>;

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      return;
    }
    const existingAdmin = await this.findByEmail(email);
    if (existingAdmin) {
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.create({ email, name: 'Admin', role: Role.ADMIN, passwordHash });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  create(data: NewUser): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(data));
  }
}