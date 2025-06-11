import { Module } from '@nestjs/common';
import { CarousselService } from './caroussel.service';
import { CarousselController } from './caroussel.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageUploadController } from './../image-upload/image-upload.controller';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
@Module({
  controllers: [CarousselController,ImageUploadController],
  providers: [CarousselService, PrismaService,ImageUploadService],
})
export class CarousselModule {} 
