import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Le nom du produit est requis.' })
  @IsString({ message: 'Le nom du produit doit être une chaîne de caractères.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  description?: string;

  @Type(() => Number)
  @IsNotEmpty({ message: 'Le prix est requis.' })
  @IsNumber({}, { message: 'Le prix doit être un nombre.' })
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price: number;

  @Type(() => Number)
  @IsNotEmpty({ message: 'Le stock est requis.' })
  @IsInt({ message: 'Le stock doit être un entier.' })
  stock: number;

  @Type(() => Number)
  @IsNotEmpty({ message: 'La catégorie est requise.' })
  @IsInt({ message: 'L\'identifiant de la catégorie doit être un entier.' })
  categoryId: number;

  @IsArray({ message: 'Les couleurs doivent être un tableau.' })
  @ArrayNotEmpty({ message: 'Au moins une couleur est requise.' })
  @IsString({ each: true, message: 'Chaque couleur doit être une chaîne de caractères.' })
  colors: string[];

  @IsArray({ message: 'Les tailles doivent être un tableau.' })
  @ArrayNotEmpty({ message: 'Au moins une taille est requise.' })
  @IsString({ each: true, message: 'Chaque taille doit être une chaîne de caractères.' })
  sizes: string[];
  @IsArray({ message: 'Les caracteristiques doivent être un tableau.' })
  @ArrayNotEmpty({ message: 'Au moins une caracteristique est requise.' })
  @IsString({ each: true, message: 'Chaque caracteristique doit être une chaîne de caractères.' })
  feature: string[];

  @IsNotEmpty({ message: 'L\'image principale est requise.' })
  @IsString({ message: 'L\'URL de l\'image principale doit être une chaîne de caractères.' })
  imageUrl: string;

  @IsArray({ message: 'Les images supplémentaires doivent être un tableau.' })
  @IsOptional()
  @IsString({ each: true, message: 'Chaque URL d\'image supplémentaire doit être une chaîne de caractères.' })
  imageUrls?: string[];

  @IsOptional()
  @IsString({ message: 'L\'offre doit être une chaîne de caractères.' })
  offer?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'La remise doit être un nombre.' })
  // @IsPositive({ message: 'La remise doit être un nombre positif.' })
  discount?: number;
}
