import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCarousselDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}
