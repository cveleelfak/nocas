import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePartyDto } from './create-party.dto';

export class UpdatePartyDto extends PartialType(OmitType(CreatePartyDto, ['venueId'] as const)) {}