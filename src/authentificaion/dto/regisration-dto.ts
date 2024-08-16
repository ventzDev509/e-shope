import { $Enums, UserRole } from '@prisma/client';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsEnum(UserRole) 
  role?: UserRole; 
}
