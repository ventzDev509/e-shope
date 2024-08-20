// dto/reset-password.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  // @IsNotEmpty()
  // @IsString()
  // token: string;

  // @IsNotEmpty()
  // @IsString()
  // email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
