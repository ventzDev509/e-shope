import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
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
}
