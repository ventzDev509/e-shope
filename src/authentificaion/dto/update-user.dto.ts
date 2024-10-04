import { $Enums, UserRole } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  telephone?: string;
  

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  adress?: string;

}
