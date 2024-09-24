import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCarousselDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}
