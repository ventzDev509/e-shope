import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateuserDto {
  @IsString()
  @IsNotEmpty()
  readonly nom: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly motDePasse: string;

  @IsString()
  @IsNotEmpty()
  readonly role: string;
  @IsString()
  @IsOptional()
  readonly profile: string;

}
