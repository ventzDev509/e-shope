import { IsArray, IsOptional, IsString, IsNumber,IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string; // New field for the image URL
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
