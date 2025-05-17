import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ImageUploadService } from './image-upload.service';
import { Express } from 'express';

@Controller('upload')
export class ImageUploadController {
  constructor(private readonly imageUploadService: ImageUploadService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor()) 
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const primaryFile = files.find(file => file.fieldname === 'primaryFile');
    const secondaryFiles = files.filter(file =>
      file.fieldname.startsWith('secondaryFile_'),
    );

    if (!primaryFile) {
      throw new Error('Primary image is required');
    }

    const primaryUpload = await this.imageUploadService.uploadImage(primaryFile);
    const secondaryUploads = await Promise.all(
      secondaryFiles.map(file => this.imageUploadService.uploadImage(file)),
    );

    return {
      primaryUrl: primaryUpload.url,
      secondaryUrls: secondaryUploads.map(upload => upload.url),
    };
  }
  @Post('/image')
  @UseInterceptors(AnyFilesInterceptor()) 
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    const primaryFile = files.find(file => file.fieldname === 'primaryFile');
   

    if (!primaryFile) {
      throw new Error('Primary image is required');
    }  

    const primaryUpload = await this.imageUploadService.uploadImage(primaryFile);
   

    return {
      primaryUrl: primaryUpload?.url,
    }; 
  }
}
