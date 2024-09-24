import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOffreVisibleDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
