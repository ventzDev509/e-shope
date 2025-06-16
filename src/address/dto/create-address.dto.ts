import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  firstName: string;

  @IsNotEmpty({ message: 'Le nom est requis.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  lastName: string;

  @IsNotEmpty({ message: "L'email est requis." })
  @IsEmail({}, { message: "L'email doit être valide." })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
  phone?: string;

  @IsNotEmpty({ message: 'La rue est requise.' })
  @IsString({ message: 'La rue doit être une chaîne de caractères.' })
  street: string;

  @IsNotEmpty({ message: 'La ville est requise.' })
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  city: string;

  @IsNotEmpty({ message: "L'état est requis." })
  @IsString({ message: "L'état doit être une chaîne de caractères." })
  state: string;

  @IsNotEmpty({ message: 'Le code postal est requis.' })
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  zipCode: string;

  @IsNotEmpty({ message: 'Le pays est requis.' })
  @IsString({ message: 'Le pays doit être une chaîne de caractères.' })
  country: string;

  @IsNotEmpty({ message: 'Le numéro de téléphone est requis.' })
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
  telephone: string;

  @IsNotEmpty({ message: 'Les détails de l’adresse sont requis.' })
  @IsString({ message: "Les détails de l’adresse doivent être une chaîne de caractères." })
  addressDetails: string;

  @IsOptional()
  @IsBoolean()
  default?: boolean;
}
