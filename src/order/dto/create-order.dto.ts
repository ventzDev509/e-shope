import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  IsOptional, 
  IsArray, 
  ValidateNested, 
  IsDate 
} from 'class-validator';
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
  price: number;
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

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  estimatedDelivery?: Date; // Champ pour le temps de livraison estimé, si nécessaire
}
