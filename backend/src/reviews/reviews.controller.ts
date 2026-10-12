import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('venues/:venueId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findByVenue(@Param('venueId', ParseIntPipe) venueId: number) {
    return this.reviewsService.findByVenue(venueId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Post()
  create(
    @Param('venueId', ParseIntPipe) venueId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.create(venueId, user.id, dto);
  }
}