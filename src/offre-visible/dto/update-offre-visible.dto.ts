import { PartialType } from '@nestjs/mapped-types';
import { CreateOffreVisibleDto } from './create-offre-visible.dto';

export class UpdateOffreVisibleDto extends PartialType(CreateOffreVisibleDto) {}
