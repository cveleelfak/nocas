import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Attendance } from '../attendances/attendance.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Attendance)
    private readonly attendancesRepository: Repository<Attendance>,
  ) {}

  findByVenue(venueId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { venue: { id: venueId } },
      relations: { user: true },
      select: { id: true, rating: true, comment: true, createdAt: true, user: { id: true, name: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(venueId: number, userId: number, dto: CreateReviewDto): Promise<Review> {
    await this.ensureUserAttendedVenue(userId, venueId);
    const existing = await this.reviewsRepository.findOne({
      where: { user: { id: userId }, venue: { id: venueId } },
    });
    if (existing) {
      throw new ConflictException('Vec si ocenio ovaj lokal');
    }
    const review = this.reviewsRepository.create({
      rating: dto.rating,
      comment: dto.comment ?? '',
      user: { id: userId },
      venue: { id: venueId },
    });
    return this.reviewsRepository.save(review);
  }

  private async ensureUserAttendedVenue(userId: number, venueId: number): Promise<void> {
    const hasAttended = await this.attendancesRepository.exists({
      where: {
        user: { id: userId },
        party: { venue: { id: venueId }, startsAt: LessThan(new Date()) },
      },
    });
    if (!hasAttended) {
      throw new BadRequestException('Mozes oceniti samo lokal u kome si bio na zurci');
    }
  }
}