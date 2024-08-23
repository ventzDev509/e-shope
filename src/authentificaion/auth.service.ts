import { $Enums, UserRole } from '@prisma/client';
import { LoginDto } from './dto/login-user-dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/regisration-dto';
import { v4 as uuidv4 } from 'uuid';
import { usersService } from 'src/users/users.service';
import { PasswordService } from './password.service';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtservice: JwtService,
    private userservice: usersService,
    private readonly passwordService: PasswordService,
    private readonly mailerService: MailService, // Injection de MailerService
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { username, password } = loginDto;

    // Trouver l'utilisateur avec l'email fourni
    const user = await this.prismaService.user.findUnique({
      where: { email: username },
    });
    // Vérifie si l'utilisateur existe
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifie la validité du mot de passe
    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.password,
    );

    // Vérifie le mot de passe
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Génère un token JWT
    const token = this.jwtservice.sign({ username: user.email });

    return { token };
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;

    const users = await this.userservice.create(createUserDto);
    return {
      token: this.jwtservice.sign({ username: users.email }),
    };
  }
  // passwor reset
  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('No user found with this email');
    }

    // Générer un token unique
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Enregistrer le token dans la base de données
    await this.prismaService.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 heure
      },
    });
 
   
    // Envoyer l'email de réinitialisation de mot de passe
    await this.mailerService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto,token:string,email:string) {
    const {newPassword } = resetPasswordDto;

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !user.resetPasswordToken) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);

    if (!isTokenValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Réinitialiser le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prismaService.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password successfully reset.' };
  }
}
