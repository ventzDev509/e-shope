import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login-user-dto';
import { CreateUserDto } from './dto/regisration-dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { usersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Authantification module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: usersService,
  ) {}
  @ApiOperation({ summary: 'Login with an username and a password' })
  @Post('/login')
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: LoginDto,
  ): Promise<any> {
    try {
      const result = await this.authService.login(data);
      return response.status(200).json(result);
    } catch (error) {
      return response.status(200).json(error);
    }
  }
  @ApiOperation({
    summary: 'register a compte with a name,role,email,password',
  })
  @Post('/register')
  async register(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: CreateUserDto,
  ): Promise<any> {
    try {
      const result = await this.authService.create(data);
      return response.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return response
          .status(error.getStatus())
          .json({ message: error.message });
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle unexpected errors
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const resetToken = await this.authService.forgotPassword(email);
    return { message: 'Reset password instructions sent to email', resetToken };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Query('email') email: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) { 
    // Passer le token à la méthode de service 
    return this.authService.resetPassword(resetPasswordDto, token, email);
  }
}
