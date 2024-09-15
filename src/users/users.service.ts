import { PrismaService } from './../prisma/prisma.service';
import { $Enums, UserRole } from '@prisma/client';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserDto } from 'src/authentificaion/dto/regisration-dto';
import { PasswordService } from 'src/authentificaion/password.service';


@Injectable()
export class usersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
 
    try {
      // Vérifie si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('An account with this email already exists.');
      }

      // Hacher le mot de passe avant de l'enregistrer
      const hashedPassword = await this.passwordService.hashPassword(password);

      // Créer un utilisateur dans la base de données
      const user = await this.prisma.user.create({
        data: {
          name, 
          email,
          password: hashedPassword,
          role: role || UserRole.CUSTOMER,
          profile:""
        },
      });

      return user;
    } catch (error) { 
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user',
      );
    }
  }
 
  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`user avec l'ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('user non trouvé');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
