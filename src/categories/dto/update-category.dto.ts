import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsString({ message: 'Le nom de la catégorie doit être une chaîne de caractères.' })
  @IsOptional({ message: 'Le nom de la catégorie est optionnel.' })
  name?: string;

  @IsString({ message: 'L\'URL de l\'image doit être une chaîne de caractères.' })
  @IsOptional({ message: 'L\'URL de l\'image est optionnelle.' })
  imageUrl?: string;
}
