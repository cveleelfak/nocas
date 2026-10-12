import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from '../parties/party.entity';
import { Attendance } from './attendance.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Party])],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}