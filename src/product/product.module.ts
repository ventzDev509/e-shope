import { ImageUploadController } from './../image-upload/image-upload.controller';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController, ImageUploadController],
  providers: [ProductService, ImageUploadService]
})
export class ProductModule {}
