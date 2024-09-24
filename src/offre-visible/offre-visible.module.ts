import { Module } from '@nestjs/common';
import { OffreVisibleService } from './offre-visible.service';
import { OffreVisibleController } from './offre-visible.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OffreVisibleController],
  providers: [OffreVisibleService, PrismaService],
})
export class OffreVisibleModule {}
