import { PartialType } from '@nestjs/swagger';
import { AddColorDto } from './add-color.dto';

export class UpdateColorDto extends PartialType(AddColorDto) {}
