import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayNotEmpty, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsInt()
  stock: number;

  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  colors: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sizes: string[];

  @IsNotEmpty()
  @IsString()
  imageUrl: string;  // New field for the image link

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  offer?: string;  // New field for the offer

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discount?: number;  // New field for the discount
}
