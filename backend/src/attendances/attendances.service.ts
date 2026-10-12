import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalStatus } from '../common/approval-status.enum';
import { Party } from '../parties/party.entity';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendancesRepository: Repository<Attendance>,
    @InjectRepository(Party)
    private readonly partiesRepository: Repository<Party>,
  ) {}

  async attend(partyId: number, userId: number): Promise<Attendance> {
    const party = await this.partiesRepository.findOne({
      where: { id: partyId, status: ApprovalStatus.APPROVED },
    });
    if (!party) {
      throw new NotFoundException('Zurka ne postoji ili nije odobrena');
    }
    const existing = await this.findByUserAndParty(userId, partyId);
    if (existing) {
      return existing;
    }
    const attendance = this.attendancesRepository.create({
      user: { id: userId },
      party: { id: partyId },
    });
    return this.attendancesRepository.save(attendance);
  }

  async cancel(partyId: number, userId: number): Promise<void> {
    const attendance = await this.findByUserAndParty(userId, partyId);
    if (attendance) {
      await this.attendancesRepository.remove(attendance);
    }
  }

  findMine(userId: number): Promise<Attendance[]> {
    return this.attendancesRepository.find({
      where: { user: { id: userId } },
      relations: { party: { venue: true, genres: true } },
      order: { party: { startsAt: 'DESC' } },
    });
  }

  private findByUserAndParty(userId: number, partyId: number): Promise<Attendance | null> {
    return this.attendancesRepository.findOne({
      where: { user: { id: userId }, party: { id: partyId } },
    });
  }
}