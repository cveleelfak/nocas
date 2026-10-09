import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReviewDto } from '../common/dto/review.dto';
import { Role } from '../users/role.enum';
import { CreatePartyDto } from './dto/create-party.dto';
import { FindPartiesQueryDto } from './dto/find-parties-query.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  findApproved(@Query() query: FindPartiesQueryDto) {
    return this.partiesService.findApproved(query.date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.partiesService.findByOwner(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('pending')
  findPending() {
    return this.partiesService.findPending();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partiesService.findOneOrFail(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post()
  create(@Body() dto: CreatePartyDto, @CurrentUser() user: AuthUser) {
    return this.partiesService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.partiesService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/review')
  review(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewDto) {
    return this.partiesService.review(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.partiesService.remove(id, user);
  }
}