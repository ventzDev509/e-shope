import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsString()
  sizes: string;

  @IsNotEmpty()
  @IsString()
  colors: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
