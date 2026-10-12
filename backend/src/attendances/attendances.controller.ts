import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/role.enum';
import { AttendancesService } from './attendances.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.attendancesService.findMine(user.id);
  }

  @Post(':partyId')
  attend(@Param('partyId', ParseIntPipe) partyId: number, @CurrentUser() user: AuthUser) {
    return this.attendancesService.attend(partyId, user.id);
  }

  @HttpCode(204)
  @Delete(':partyId')
  cancel(@Param('partyId', ParseIntPipe) partyId: number, @CurrentUser() user: AuthUser) {
    return this.attendancesService.cancel(partyId, user.id);
  }
}