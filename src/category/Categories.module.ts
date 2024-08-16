import { Module } from '@nestjs/common';
import { CategoriesController } from './Categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  providers: [CategoriesService],
  controllers: [CategoriesController]
})
export class CategoryModule {}
