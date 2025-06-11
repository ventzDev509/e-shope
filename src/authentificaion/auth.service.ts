import { $Enums } from '@prisma/client';
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
import { usersService } from 'src/users/users.service';
import { PasswordService } from './password.service';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mailer/mailer.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtservice: JwtService,
    private userservice: usersService,
    private readonly passwordService: PasswordService,
    private readonly mailerService: MailService, 
  ) { }

  async login(loginDto: LoginDto): Promise<{ token: string, isConfirm: boolean, isAdmin: boolean }> {
    const { username, password } = loginDto;

    // Trouver l'utilisateur avec l'email fourni
    const user = await this.prismaService.user.findUnique({
      where: { email: username },
    });
    // Vérifie si l'utilisateur existe
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Vérifie si l'utilisateur existe
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException('Email not confrimed');
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
    const isConfirm = user.isEmailConfirmed
    let isAdmin = user.role == "ADMIN" ? true : false
    return { token, isConfirm, isAdmin };
  }
  async createWithGoogle(googleUser: {
    email: string;
    name: string;
    image: string;
  }) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUser) return existingUser;

    const randomPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);


    return await this.prismaService.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        profile: googleUser.image,
        provider: 'google',
        password: randomPassword,
        isEmailConfirmed: true
      },
    });
  }
  async loginWithGoogle(googleUser: {
    email: string;
    name: string;
    image: string;
  }) {
    let user = await this.prismaService.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.createWithGoogle(googleUser);
    }

    const token = this.jwtservice.sign({ username: user.email });
     let isAdmin = user.role == "ADMIN" ? true : false
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        provider: user.provider,
        isAdmin:isAdmin
      },
    };
  }

  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtservice.sign(payload),
      user,
    };
  }


  async create(createUserDto: CreateUserDto) {
    try {
      // 1. Vérifier si l'utilisateur avec cet email existe déjà
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        // Si l'email existe déjà, renvoyer une erreur explicite sans planter le serveur
        throw new Error('Un compte avec cet email existe déjà.');
      }

      // 2. Création de l'utilisateur
      const user = await this.userservice.create(createUserDto);

      // 3. Génération d’un token unique de confirmation
      const confirmationToken = randomBytes(32).toString('hex');

      // 4. Enregistrement du token dans la base
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { confirmationToken },
      });

      // 5. Envoi de l'email de confirmation
      const confirmUrl = `${process.env.LINK}/confirm-email?token=${confirmationToken}`;

      try {
        // Envoi de l'email dans un bloc try...catch pour capturer les erreurs de connexion SMTP
        await this.mailerService.sendConfirmationEmail(user.email, confirmUrl);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError.message);
        // Tu peux envoyer un message de retour indiquant un échec, mais ne pas faire échouer l'inscription
      }

      // 6. Retourner un message (optionnel)
      return {
        message: 'Inscription réussie. Veuillez confirmer votre email.',
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription de l\'utilisateur:', error.message);
      throw new ExceptionsHandler(error.message || 'Une erreur est survenue lors de l\'inscription de l\'utilisateur.');
    }
  }


  async confirmEmail(token: string) {
    // Recherche de l'utilisateur avec ce token
    const user = await this.prismaService.user.findFirst({
      where: { confirmationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token invalide ou utilisateur non trouvé.');
    }

    // Mise à jour de l'utilisateur pour confirmer l'email
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        isEmailConfirmed: true,
        confirmationToken: null,
      },
    });

    return { message: 'Email confirmé avec succès.' };
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto, imageUrl) {
    const { name, telephone, adress } = updateUserDto;

    // Trouver l'utilisateur par ID
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    let updatedUser;
    if (imageUrl) {
      // Mettre à jour l'utilisateur
      updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          name: name || user.name,
          adress: adress || user.adress,
          telephone: telephone || user.telephone,
          profile: imageUrl || user.profile,
        },
      });
    } else {
      // Mettre à jour l'utilisateur
      updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          name: name || user.name,
          adress: adress || user.adress,
          telephone: telephone || user.telephone,
        },
      });
    }

    // Supprimer les champs sensibles
    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.resetPasswordExpires;

    return updatedUser;
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
  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`user avec l'ID ${id} non trouvé`);
    }
    delete user.password;
    delete user.resetPasswordExpires;
    delete user.resetPasswordToken;

    return user;
  }
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
    email: string,
  ) {
    const { newPassword } = resetPasswordDto;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

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
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la réinitialisation',
      );
    }
  }
}
