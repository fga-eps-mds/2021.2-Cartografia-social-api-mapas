import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { async } from 'rxjs';
import { MicrosserviceException } from '../commons/exceptions/MicrosserviceException';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreatePointDto } from './dto/create-point.dto';
import { MediaRelationDto } from './dto/media-relation.dto';
import { PointDto } from './dto/point.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { Area, AreaDocument } from './entities/area.schema';
import {
  MediaRelation,
  MediaRelationDocument,
} from './entities/mediaRelation.schema';
import { Point, PointDocument } from './entities/point.schema';

@Injectable()
export class MapasService {
  constructor(
    @InjectModel(Point.name)
    private pointModel: Model<PointDocument>,
    @InjectModel(Area.name)
    private areaModel: Model<AreaDocument>,
    @InjectModel(MediaRelation.name)
    private mediaRelationModel: Model<MediaRelationDocument>,
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

  private async getPoint(id: string) {
    const point = await this.pointModel.findById(id);

    if (!point)
      throw new MicrosserviceException(
        'Ponto não encontrada',
        HttpStatus.NOT_FOUND,
      );

    return point;
  }

  async getPointWithMidia(id: string) {
    const point = await this.getPoint(id);
    const medias = this.getMediaList(point);

    const pointDto = PointDto.convertFromPointDocument(point);
    pointDto.medias = await medias;

    return pointDto;
  }

  async addMediaToPoint(mediaRelationDto: MediaRelationDto) {
    const point = this.getPoint(mediaRelationDto.locationId);

    const mediaRelation = new this.mediaRelationModel({
      locationId: (await point).id,
      mediaId: mediaRelationDto.mediaId,
    });

    try {
      const result = await mediaRelation.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteMediaFromPoint(mediaRelationDto: MediaRelationDto) {
    const deletedDocument = await this.mediaRelationModel.findOneAndDelete({
      pointId: mediaRelationDto.locationId,
      mediaId: mediaRelationDto.mediaId,
    });

    return !!deletedDocument;
  }

  async deletePoint(id: string) {
    const point = await this.getPoint(id);
    const medias = await this.getMediaList(point);

    const mediaData = new MediaRelationDto();
    mediaData.locationId = point.id;

    for (const media of medias) {
      mediaData.mediaId = media.id;
      await this.deleteMediaFromPoint(mediaData);
    }

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

  async updateArea(updateAreaDto: UpdateAreaDto) {
    const area = await this.getPoint(updateAreaDto.id);

    if (!area) {
      throw new MicrosserviceException(
        'Area não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    area.description = updateAreaDto.description || area.description;
    area.title = updateAreaDto.title || area.title;

    try {
      const result = area.save();
      return (await result).id;
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

  private async getMediaList(object: PointDocument | AreaDocument) {
    return this.mediaRelationModel.find({ id: object.id });
  }
}
