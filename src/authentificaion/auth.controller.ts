import { diskStorage } from 'multer';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login-user-dto';
import { CreateUserDto } from './dto/regisration-dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { usersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './auth.guard';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
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
  // Route pour mettre à jour un utilisateur



  @Put('/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Dossier où les images seront stockées
        filename: (req, file, cb) => {
          // Générer un nom de fichier unique en utilisant la date et un identifiant aléatoire
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
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
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
    @Body() updateUserDto: UpdateUserDto,
   
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Construire l'URL complète de l'image téléchargée
      const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const userId = req.user.id;
      console.log(baseUrl)

      // Correction : Assurez-vous que la méthode updateUser retourne un User
      const updatedUser = await this.authService.updateUser(
        userId,
        updateUserDto,
        imageUrl,
      );
      return res.status(HttpStatus.OK).json(updatedUser); // Ajout d'une réponse réussie
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      // Handle unexpected errors
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred while creating the product',
      });
    }
  }









  // @Put('/update')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads', // Dossier où les images seront stockées
  //       filename: (req, file, cb) => {
  //         // Générer un nom de fichier unique en utilisant la date et un identifiant aléatoire
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
  //         cb(null, filename);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
  //         cb(new BadRequestException('Only image files are allowed!'), false);
  //       } else {
  //         cb(null, true);
  //       }
  //     },
  //   }),
  // )
  // async update(
  //   @UploadedFile() file: Express.MulterFile,
  //   @Req() req,
  //   @Res() res,
  //   @Body() updateUserDto: UpdateUserDto,
  // ): Promise<User> {
  //   console.log(updateUserDto)
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded');
  //   }

  //   try {
  //     // Construire l'URL complète de l'image téléchargée
  //     const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
  //     const imageUrl = `${baseUrl}/uploads/${file.filename}`;
  //     const userId = req.user.id;

  //     // Correction : Assurez-vous que la méthode updateUser retourne un User
  //     const updatedUser = await this.authService.updateUser(
  //       userId,
  //       updateUserDto,
  //       imageUrl,
  //     );
  //     return res.status(HttpStatus.OK).json(updatedUser); // Ajout d'une réponse réussie
  //   } catch (error) {
  //     // Handle known exceptions
  //     if (error instanceof HttpException) {
  //       return res.status(error.getStatus()).json({ message: error.message });
  //     }

  //     // Handle unexpected errors
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       message: 'An unexpected error occurred while updating the user', // Correction du message
  //     });
  //   }
  // }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Query('email') email: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    // Passer le token à la méthode de service
    return this.authService.resetPassword(resetPasswordDto, token, email);
  }
  @Get('/user')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Res() res: Response, @Req() req) {
    try {
      const userId = req.user.id;
      const response = await this.authService.findOne(userId);
      return res.json(response);
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      // Handle unexpected errors
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
    }
  }
}
