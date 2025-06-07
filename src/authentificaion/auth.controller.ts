
import {
  BadRequestException, Body, ConflictException, Controller, Get,
  HttpException, HttpStatus, Param, Patch, Post, Put, Query, Req, Res,
  UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login-user-dto';
import { CreateUserDto } from './dto/regisration-dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { usersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // Crée ce fichier DTO
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
@ApiTags('Authantification module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: usersService,
    private jwtservice: JwtService,
  ) { }
  @Post('google/token')
  async verifyGoogleToken(@Body() body: { token: string }, @Res() res: Response) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: body.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Token payload is invalid');
      }

      const { email, name, picture, sub } = payload;

      // Vérifie si l'utilisateur existe
      let user = await this.userService.findByEmail(email);
      if (!user) {
        // Crée l'utilisateur s'il n'existe pas
        user = await this.authService.createWithGoogle({
          email,
          name,
          image: picture,
        });
      }

      // Génère le token JWT
      const t = this.jwtservice.sign({ username: user.email });

      delete user.password
      delete user.createdAt
      delete user.updatedAt
      delete user.provider
      delete user.resetPasswordExpires
      delete user.resetPasswordToken

      return res.status(200).json({ t, user });
    } catch (error) {
      console.error('Google Token Verification Error:', error);
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid Google token' });
    }
  }
  @Post('google')
  async loginWithGoogle(@Body() googleUser: { email: string; name: string; image: string }) {
    return this.authService.loginWithGoogle(googleUser);
  }
  @ApiOperation({ summary: 'Login with email and password' })
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
      console.error(error);
      return response.status(error.status || 500).json({ message: error.message || 'Login error' });
    }
  }

  @ApiOperation({ summary: 'Register a user' })
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
      console.error(error);
      if (error instanceof HttpException) {
        return response
          .status(error.getStatus())
          .json({ message: error.message });
      } 
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
    }
  }
  @Put('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Put('/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Res() res,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const baseUrl = process.env.UPLOAD_LINK;
      const imageUrl = file ? `${baseUrl}/uploads/${file.filename}` : '';
      const userId = req.user.id;

      const updatedUser = await this.authService.updateUser(
        userId,
        updateUserDto,
        imageUrl,
      );
      return res.status(HttpStatus.OK).json(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred while updating the user',
      });
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Query('email') email: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto, token, email);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Res() res: Response, @Req() req) {
    try {
      const userId = req.user.id;
      const response = await this.authService.findOne(userId);
      return res.json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
    }
  }
}
