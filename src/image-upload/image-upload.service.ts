import { Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';
import { Express } from 'express';
import { UploadResponse } from 'imagekit/dist/libs/interfaces/UploadResponse';

@Injectable()
export class ImageUploadService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async uploadImage(file: Express.MulterFile): Promise<UploadResponse> {
    const buffer = file.buffer;
    try {
      const uploadResponse = await this.imagekit.upload({
        file: buffer,
        fileName: file.originalname,
      });
      return uploadResponse;
    } catch (error) { 
      // console.log(error)
    }


  }
}
