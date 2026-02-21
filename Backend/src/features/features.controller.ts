import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { FeaturesService } from './features.service';

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.featuresService.create(body);
  }

  @Get()
  findAll() {
    return this.featuresService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.featuresService.remove(+id);
  }
}