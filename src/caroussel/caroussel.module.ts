import { Module } from '@nestjs/common';
import { CarousselService } from './caroussel.service';
import { CarousselController } from './caroussel.controller';

@Module({
  providers: [CarousselService],
  controllers: [CarousselController]
})
export class CarousselModule {}
