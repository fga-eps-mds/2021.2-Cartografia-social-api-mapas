import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MicrosserviceException } from '../commons/exceptions/MicrosserviceException';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { Area, AreaDocument } from './entities/area.schema';
import { Point, PointDocument } from './entities/point.schema';

@Injectable()
export class MapasService {
  constructor(
    @InjectModel(Point.name)
    private pointModel: Model<PointDocument>,
    @InjectModel(Area.name)
    private areaModel: Model<AreaDocument>,
  ) {}

  async createPoint(createPointDto: CreatePointDto) {
    const point = new this.pointModel({
      title: createPointDto.title,
      description: createPointDto.description,
      coordinates: [createPointDto.longitude, createPointDto.latitude],
    });

    try {
      const result = await point.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updatePoint(updatePointDto: UpdatePointDto) {
    const point = await this.getPoint(updatePointDto.id);

    if (!point) {
      throw new MicrosserviceException(
        'Ponto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    point.description = updatePointDto.description || point.description;
    point.title = updatePointDto.title || point.title;

    try {
      const result = point.save();
      return (await result).id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getPoint(id: string) {
    const point = await this.pointModel.findById(id);

    if (!point)
      throw new MicrosserviceException(
        'Ponto não encontrada',
        HttpStatus.NOT_FOUND,
      );

    return point;
  }

  async deletePoint(id: string) {
    const point = await this.getPoint(id);

    return point.delete();
  }

  async createArea(createAreaDto: CreateAreaDto) {
    const coordinates = createAreaDto.coordinates.map((value) => {
      return [value.longitude, value.latitude];
    });

    if (
      coordinates[0][0] != coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] != coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0]);
    }

    const area = new this.areaModel({
      title: createAreaDto.title,
      description: createAreaDto.description,
      coordinates: [coordinates],
    });

    try {
      const result = await area.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getArea(id: string) {
    const area = await this.areaModel.findById(id);

    if (!area)
      throw new MicrosserviceException(
        'Area não encontrada',
        HttpStatus.NOT_FOUND,
      );

    return area;
  }

  async deleteArea(id: string) {
    const area = await this.getArea(id);

    return await area.delete();
  }
}
