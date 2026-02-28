import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSizeDto } from './dto/create-size.dto';
import { Size } from './entities/size.entity';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async create(createSizeDto: CreateSizeDto) {
    const size = this.sizeRepository.create(createSizeDto);
    return await this.sizeRepository.save(size);
  }

  async findAll() {
    return await this.sizeRepository.find();
  }

  async remove(id: number) {
    const result = await this.sizeRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Size with id ${id} not found`);
    }
  }
}