import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/auth.types';
import { ApprovalStatus } from '../common/approval-status.enum';
import { Role } from '../users/role.enum';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Venue } from './venue.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venuesRepository: Repository<Venue>,
  ) {}

  create(dto: CreateVenueDto, ownerId: number): Promise<Venue> {
    const venue = this.venuesRepository.create({ ...dto, owner: { id: ownerId } });
    return this.venuesRepository.save(venue);
  }

  findApproved(): Promise<Venue[]> {
    return this.venuesRepository.find({
      where: { status: ApprovalStatus.APPROVED },
      order: { name: 'ASC' },
    });
  }

  findByOwner(ownerId: number): Promise<Venue[]> {
    return this.venuesRepository.find({
      where: { owner: { id: ownerId } },
      order: { name: 'ASC' },
    });
  }

  findPending(): Promise<Venue[]> {
    return this.venuesRepository.find({
      where: { status: ApprovalStatus.PENDING },
      relations: { owner: true },
    });
  }

  async findOneOrFail(id: number): Promise<Venue> {
    const venue = await this.venuesRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!venue) {
      throw new NotFoundException('Lokal ne postoji');
    }
    return venue;
  }

  async findOwnedOrFail(id: number, ownerId: number): Promise<Venue> {
    const venue = await this.findOneOrFail(id);
    if (venue.owner.id !== ownerId) {
      throw new ForbiddenException('Ovaj lokal ne pripada tebi');
    }
    return venue;
  }

  async update(id: number, dto: UpdateVenueDto, ownerId: number): Promise<Venue> {
    const venue = await this.findOwnedOrFail(id, ownerId);
    Object.assign(venue, dto);
    return this.venuesRepository.save(venue);
  }

  async remove(id: number, user: AuthUser): Promise<void> {
    const venue = await this.findOneOrFail(id);
    const canRemove = user.role === Role.ADMIN || venue.owner.id === user.id;
    if (!canRemove) {
      throw new ForbiddenException('Ovaj lokal ne pripada tebi');
    }
    await this.venuesRepository.remove(venue);
  }

  async review(id: number, status: ApprovalStatus): Promise<Venue> {
    const venue = await this.findOneOrFail(id);
    venue.status = status;
    return this.venuesRepository.save(venue);
  }
}