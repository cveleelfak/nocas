import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../approval-status.enum';

export class ReviewDto {
  @IsIn([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED])
  status!: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}