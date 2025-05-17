import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Le nom de la catégorie doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom de la catégorie ne peut pas être vide.' })
  name: string;

  @IsString({ message: 'L\'URL de l\'image doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'L\'URL de l\'image ne peut pas être vide.' })
  imageUrl: string;
}
