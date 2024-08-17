import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
