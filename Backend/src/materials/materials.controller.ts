import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(+id);
  }
}