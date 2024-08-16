import { $Enums, UserRole } from '@prisma/client';
import { LoginDto } from './dto/login-user-dto';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/regisration-dto';

import { usersService } from 'src/users/users.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtservice: JwtService,
    private userservice: usersService,
    private readonly passwordService: PasswordService
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
    const isPasswordValid = await this.passwordService.comparePasswords(password, user.password);

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
}
