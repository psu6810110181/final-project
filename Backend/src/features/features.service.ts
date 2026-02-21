import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
  ) {}

  create(createFeatureDto: { name: string }) {
    const feature = this.featuresRepository.create(createFeatureDto);
    return this.featuresRepository.save(feature);
  }

  findAll() {
    return this.featuresRepository.find();
  }

  async remove(id: number) {
    return await this.featuresRepository.delete(id);
  }
}