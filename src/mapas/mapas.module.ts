import { Module } from '@nestjs/common';
import { MapasService } from './mapas.service';
import { MapasController } from './mapas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Point, PointSchema } from './entities/point.schema';
import { Area, AreaSchema } from './entities/area.schema';
import { MediaRelation, MediaRelationSchema } from './entities/MediaRelation';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Point.name, schema: PointSchema }]),
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    MongooseModule.forFeature([
      { name: MediaRelation.name, schema: MediaRelationSchema },
    ]),
  ],
  controllers: [MapasController],
  providers: [MapasService],
})
export class MapasModule {}
