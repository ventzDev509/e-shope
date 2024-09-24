import { Module } from '@nestjs/common';
import { CarousselService } from './caroussel.service';
import { CarousselController } from './caroussel.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CarousselController],
  providers: [CarousselService, PrismaService],
})
export class CarousselModule {}
