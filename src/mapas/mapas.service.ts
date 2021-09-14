import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePointDto } from './dto/create-point.dto';
import { Point, PointDocument } from './entities/point.schema';

@Injectable()
export class MapasService {
  constructor(
    @InjectModel(Point.name)
    private pointModel: Model<PointDocument>,
  ) {}

  async create(createPointDto: CreatePointDto) {
    const point = new this.pointModel({
      title: createPointDto.title,
      description: createPointDto.description,
      coordinates: [createPointDto.longitude, createPointDto.latitude],
    });

    try {
      const result = await point.save();

      return result.id;
    } catch (err) {
      throw new RpcException(err.message);
    }
  }
}
