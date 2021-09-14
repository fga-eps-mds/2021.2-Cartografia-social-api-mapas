import { Module } from '@nestjs/common';
import { MapasService } from './mapas.service';
import { MapasController } from './mapas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Point, PointSchema } from './entities/point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Point.name, schema: PointSchema }]),
  ],
  controllers: [MapasController],
  providers: [MapasService],
})
export class MapasModule {}
