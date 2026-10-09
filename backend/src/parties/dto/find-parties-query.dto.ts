import { IsDateString, IsOptional } from 'class-validator';

export class FindPartiesQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}