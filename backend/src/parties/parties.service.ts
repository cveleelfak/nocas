import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuthUser } from '../auth/auth.types';
import { ApprovalStatus } from '../common/approval-status.enum';
import { ReviewDto } from '../common/dto/review.dto';
import { Genre } from '../genres/genre.entity';
import { Role } from '../users/role.enum';
import { VenuesService } from '../venues/venues.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { Party } from './party.entity';

const NIGHT_STARTS_AT_HOUR = 6;

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private readonly partiesRepository: Repository<Party>,
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
    private readonly venuesService: VenuesService,
  ) {}

  async create(dto: CreatePartyDto, ownerId: number): Promise<Party> {
    const venue = await this.venuesService.findOwnedOrFail(dto.venueId, ownerId);
    if (venue.status !== ApprovalStatus.APPROVED) {
      throw new BadRequestException('Lokal jos nije odobren');
    }
    const party = this.partiesRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      startsAt: new Date(dto.startsAt),
      price: dto.price,
      performers: dto.performers ?? '',
      venue,
      genres: await this.findGenres(dto.genreIds),
    });
    return this.partiesRepository.save(party);
  }

  findApproved(date?: string): Promise<Party[]> {
    const query = this.partiesRepository
      .createQueryBuilder('party')
      .leftJoinAndSelect('party.venue', 'venue')
      .leftJoinAndSelect('party.genres', 'genre')
      .where('party.status = :status', { status: ApprovalStatus.APPROVED })
      .orderBy('party.startsAt', 'ASC');

    if (date) {
      const { nightStart, nightEnd } = this.nightRange(date);
      query.andWhere('party.startsAt >= :nightStart AND party.startsAt < :nightEnd', {
        nightStart,
        nightEnd,
      });
    }
    return query.getMany();
  }

  findByOwner(ownerId: number): Promise<Party[]> {
    return this.partiesRepository.find({
      where: { venue: { owner: { id: ownerId } } },
      relations: { venue: true, genres: true },
      order: { startsAt: 'DESC' },
    });
  }

  findPending(): Promise<Party[]> {
    return this.partiesRepository.find({
      where: { status: ApprovalStatus.PENDING },
      relations: { venue: true, genres: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOneOrFail(id: number): Promise<Party> {
    const party = await this.partiesRepository.findOne({
      where: { id },
      relations: { venue: { owner: true }, genres: true },
    });
    if (!party) {
      throw new NotFoundException('Zurka ne postoji');
    }
    return party;
  }

  async update(id: number, dto: UpdatePartyDto, ownerId: number): Promise<Party> {
    const party = await this.findOwnedOrFail(id, ownerId);
    const { genreIds, startsAt, ...simpleFields } = dto;
    Object.assign(party, simpleFields);
    if (startsAt) {
      party.startsAt = new Date(startsAt);
    }
    if (genreIds) {
      party.genres = await this.findGenres(genreIds);
    }
    party.status = ApprovalStatus.PENDING;
    party.rejectionReason = null;
    return this.partiesRepository.save(party);
  }

  async remove(id: number, user: AuthUser): Promise<void> {
    const party = await this.findOneOrFail(id);
    const canRemove = user.role === Role.ADMIN || party.venue.owner.id === user.id;
    if (!canRemove) {
      throw new ForbiddenException('Ova zurka ne pripada tebi');
    }
    await this.partiesRepository.remove(party);
  }

  async review(id: number, dto: ReviewDto): Promise<Party> {
    const party = await this.findOneOrFail(id);
    const isRejected = dto.status === ApprovalStatus.REJECTED;
    party.status = dto.status;
    party.rejectionReason = isRejected ? (dto.rejectionReason ?? null) : null;
    return this.partiesRepository.save(party);
  }

  private async findOwnedOrFail(id: number, ownerId: number): Promise<Party> {
    const party = await this.findOneOrFail(id);
    if (party.venue.owner.id !== ownerId) {
      throw new ForbiddenException('Ova zurka ne pripada tebi');
    }
    return party;
  }

  private async findGenres(genreIds: number[]): Promise<Genre[]> {
    const genres = await this.genresRepository.findBy({ id: In(genreIds) });
    if (genres.length !== new Set(genreIds).size) {
      throw new BadRequestException('Neki od zanrova ne postoji');
    }
    return genres;
  }

  private nightRange(date: string): { nightStart: Date; nightEnd: Date } {
    const nightStart = new Date(`${date.slice(0, 10)}T00:00:00`);
    nightStart.setHours(NIGHT_STARTS_AT_HOUR);
    const nightEnd = new Date(nightStart);
    nightEnd.setDate(nightEnd.getDate() + 1);
    return { nightStart, nightEnd };
  }
}