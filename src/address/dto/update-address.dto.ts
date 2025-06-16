import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class UpdateAddressDto {
    @IsNotEmpty({ message: 'La rue est requise.' })
    @IsString({ message: 'La rue doit être une chaîne de caractères.' })
    street: string;

    @IsNotEmpty({ message: 'La ville est requise.' })
    @IsString({ message: 'La ville doit être une chaîne de caractères.' })
    city: string;

    @IsOptional()
    @IsString({ message: "L'état ou département doit être une chaîne de caractères." })
    state: string;

    @IsOptional()
    @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
    zipCode: string;

    @IsOptional()
    @IsString({ message: 'Le pays doit être une chaîne de caractères.' })
    country: "Haiti";

    @IsNotEmpty({ message: 'Le numéro de téléphone est requis.' })
    @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
    telephone: string;

    @IsNotEmpty({ message: 'Les détails de l’adresse sont requis.' })
    @IsString({ message: "Les détails de l’adresse doivent être une chaîne de caractères." })
    addressDetails: string;

    @IsBoolean({ message: 'Le champ "default" doit être un booléen.' })
    default: boolean;
}
