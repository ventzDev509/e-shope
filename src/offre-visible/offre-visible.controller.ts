import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { OffreVisibleService } from './offre-visible.service';
import { CreateOffreVisibleDto } from './dto/create-offre-visible.dto';
import { UpdateOffreVisibleDto } from './dto/update-offre-visible.dto';

@Controller('offre-visible')
export class OffreVisibleController {
  constructor(private readonly offreVisibleService: OffreVisibleService) {}

  @Post()
  async create(@Body() createOffreVisibleDto: CreateOffreVisibleDto) {
    return this.offreVisibleService.create(createOffreVisibleDto);
  }

  @Get()
  async findAll() {
    return this.offreVisibleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.offreVisibleService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id',ParseIntPipe) id: number,
    @Body() updateOffreVisibleDto: UpdateOffreVisibleDto,
  ) {
    return this.offreVisibleService.update(id, updateOffreVisibleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.offreVisibleService.remove(id);
  }
}
