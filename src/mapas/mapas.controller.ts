import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MapasService } from './mapas.service';
import { CreatePointDto } from './dto/create-point.dto';

@Controller()
export class MapasController {
  constructor(private readonly mapasService: MapasService) {}

  @MessagePattern('createPoint')
  async create(@Payload() createPointDto: CreatePointDto) {
    const id = await this.mapasService.create(createPointDto);
    return { id };
  }
}
