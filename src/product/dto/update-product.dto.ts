import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  ArrayNotEmpty,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Le nom du produit doit être une chaîne de caractères.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le prix doit être un nombre.' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Le stock doit être un nombre.' })
  stock?: number;

  @IsOptional()
  @IsNumber({}, { message: 'L\'identifiant de la catégorie doit être un nombre.' })
  categoryId?: number;

  @IsOptional()
  @IsArray({ message: 'Les couleurs doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque couleur doit être une chaîne de caractères.' })
  colors?: string[];

  @IsOptional()
  @IsArray({ message: 'Les tailles doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque taille doit être une chaîne de caractères.' })
  sizes?: string[];

  @IsOptional()
  @IsString({ message: 'L\'URL de l\'image principale doit être une chaîne de caractères.' })
  imageUrl?: string;

  @IsOptional()
  @IsArray({ message: 'Les images supplémentaires doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque URL d\'image supplémentaire doit être une chaîne de caractères.' })
  imageUrls?: string[];

  @IsOptional()
  @IsString({ message: 'L\'offre doit être une chaîne de caractères.' })
  offer?: string;

  
  @IsArray({ message: 'Les caracteristiques doivent être un tableau.' })
  @ArrayNotEmpty({ message: 'Au moins une caracteristique est requise.' })
  @IsString({ each: true, message: 'Chaque caracteristique doit être une chaîne de caractères.' })
  feature: string[];

  @IsOptional()
  @IsNumber({}, { message: 'La remise doit être un nombre.' })
  @IsPositive({ message: 'La remise doit être un nombre positif.' })
  discount?: number;
}
