import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from '../genres/genre.entity';
import { VenuesModule } from '../venues/venues.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Party, Genre]), VenuesModule],
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}