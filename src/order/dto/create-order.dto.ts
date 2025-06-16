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
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

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

  // Ajout du champ colors (tableau de chaînes)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  // Ajout du champ sizes (tableau de chaînes)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

}

class PaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsOptional()
  @IsString()
  method:string;
  @IsOptional()
  @IsString()
  status?: string; // 'PENDING', 'COMPLETED', 'FAILED'
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  status?: string; //  'PENDING', 'COMPLETED', 'CANCELLED'

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
  @IsNumber()
  addressId?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  newAddress?: CreateAddressDto;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  estimatedDelivery?: Date;

}
