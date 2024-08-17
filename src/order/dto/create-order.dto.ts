import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number; // Ajoutez ceci si nécessaire dans votre schéma
}

class PaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  status?: string; // Par exemple: 'PENDING', 'COMPLETED', 'FAILED'
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  // @IsNotEmpty()
  // @IsNumber()
  // total: number;

  @IsOptional()
  @IsString()
  status?: string; // Par exemple: 'PENDING', 'COMPLETED', 'CANCELLED'

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments?: PaymentDto[];
}
