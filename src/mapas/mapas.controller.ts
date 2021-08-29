import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MapasService } from './mapas.service';
import { CreateMapaDto } from './dto/create-mapa.dto';
import { UpdateMapaDto } from './dto/update-mapa.dto';

@Controller()
export class MapasController {
  constructor(private readonly mapasService: MapasService) {}

  @MessagePattern('createMapa')
  create(@Payload() createMapaDto: CreateMapaDto) {
    return this.mapasService.create(createMapaDto);
  }

  @MessagePattern('findAllMapas')
  findAll() {
    return this.mapasService.findAll();
  }

  @MessagePattern('findOneMapa')
  findOne(@Payload() id: number) {
    return this.mapasService.findOne(id);
  }

  @MessagePattern('updateMapa')
  update(@Payload() updateMapaDto: UpdateMapaDto) {
    return this.mapasService.update(updateMapaDto.id, updateMapaDto);
  }

  @MessagePattern('removeMapa')
  remove(@Payload() id: number) {
    return this.mapasService.remove(id);
  }
}
