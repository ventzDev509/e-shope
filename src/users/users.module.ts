import { Module } from '@nestjs/common';
import { usersService } from './users.service';
import { usersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from 'src/authentificaion/password.service';

@Module({
  imports: [],
  controllers: [usersController],
  providers: [usersService, PrismaService,PasswordService],
  exports: [usersService], // Assure-toi que usersService est exporté
})
export class usersModule {}
