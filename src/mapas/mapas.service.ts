import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MicrosserviceException } from '../commons/exceptions/MicrosserviceException';
import { AreaDto } from './dto/area.dto';
import { CommunityDataDto } from './dto/communityData.dto';
import { CommunityOperationDto } from './dto/communityOperation.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreatePointDto } from './dto/create-point.dto';
import { MediaRelationDto } from './dto/media-relation.dto';
import { PointDto } from './dto/point.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { Area, AreaDocument } from './entities/area.schema';
import {
  CommunityRelation,
  CommunityRelationDocument,
} from './entities/communityRelation.schema';
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
    @InjectModel(CommunityRelation.name)
    private communityRelationModel: Model<CommunityRelationDocument>,
  ) {}

  async createPoint(createPointDto: CreatePointDto) {
    const point = new this.pointModel({
      title: createPointDto.title,
      validated: createPointDto.validated,
      member: createPointDto.member,
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
    point.validated = updatePointDto.validated || point.validated;
    point.member = updatePointDto.member || point.member;

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
    const point = await this.getPoint(mediaRelationDto.locationId);

    return this.addMediaRelation(point, mediaRelationDto);
  }

  async deleteMediaFromPoint(mediaRelationDto: MediaRelationDto) {
    return this.deleteMediaRelation(mediaRelationDto);
  }

  async deletePoint(id: string) {
    const point = await this.getPoint(id);
    const medias = await this.getMediaList(point);

    await this.deleteAllMediaFromObject(point.id, medias);
    await this.deleteCommunityRelation(point.id);

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
      validated: createAreaDto.validated,
      member: createAreaDto.member
    });

    try {
      const result = await area.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateArea(updateAreaDto: UpdateAreaDto) {
    const area = await this.getArea(updateAreaDto.id);

    if (!area) {
      throw new MicrosserviceException(
        'Area não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    area.description = updateAreaDto.description || area.description;
    area.title = updateAreaDto.title || area.title;
    area.validated = updateAreaDto.validated || area.validated;
    area.member = updateAreaDto.member || area.member;

    try {
      const result = area.save();
      return (await result).id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async getArea(id: string) {
    const area = await this.areaModel.findById(id);

    if (!area)
      throw new MicrosserviceException(
        'Area não encontrada',
        HttpStatus.NOT_FOUND,
      );

    return area;
  }

  async getAreaWithMidia(id: string) {
    const area = await this.getArea(id);
    const areaDto = AreaDto.convertFromAreaDocument(area);
    areaDto.medias = await this.getMediaList(area);

    return areaDto;
  }

  async addMediaToArea(mediaRelationDto: MediaRelationDto) {
    const area = await this.getArea(mediaRelationDto.locationId);

    return this.addMediaRelation(area, mediaRelationDto);
  }

  async deleteMediaFromArea(mediaRelationDto: MediaRelationDto) {
    return this.deleteMediaRelation(mediaRelationDto);
  }

  async deleteArea(id: string) {
    const area = await this.getArea(id);
    const medias = await this.getMediaList(area);

    await this.deleteAllMediaFromObject(area.id, medias);
    await this.deleteCommunityRelation(area.id);

    return await area.delete();
  }

  private async getMediaList(object: PointDocument | AreaDocument) {
    return await this.mediaRelationModel.find({ locationId: object.id });
  }

  private async addMediaRelation(
    object: PointDocument | AreaDocument,
    mediaRelationDto: MediaRelationDto,
  ) {
    const mediaRelation = new this.mediaRelationModel({
      locationId: object.id,
      mediaId: mediaRelationDto.mediaId,
    });

    try {
      const result = await mediaRelation.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async deleteAllMediaFromObject(id: string, medias: MediaRelation[]) {
    const mediaData = new MediaRelationDto();
    mediaData.locationId = id;

    for (const media of medias) {
      mediaData.mediaId = media.mediaId;
      await this.deleteMediaFromPoint(mediaData);
    }
  }

  private async deleteMediaRelation(mediaRelationDto: MediaRelationDto) {
    const deletedDocument = await this.mediaRelationModel.findOneAndDelete({
      locationId: mediaRelationDto.locationId,
      mediaId: mediaRelationDto.mediaId,
    });

    return !!deletedDocument;
  }

  private async getPointOrArea(id: string) {
    let found: AreaDocument | PointDocument = null;

    try {
      found = await this.getPoint(id);
    } catch {
      try {
        found = await this.getArea(id);
      } catch {
        found = null;
      }
    }

    return found;
  }

  private async getPointOrAreaWithMedia(id: string) {
    let found: AreaDto | PointDto = null;

    try {
      found = await this.getPointWithMidia(id);
    } catch {
      try {
        found = await this.getAreaWithMidia(id);
      } catch {
        found = null;
      }
    }
    return found;
  }

  private async addCommunityRelation(
    object: PointDocument | AreaDocument,
    communityOperationDto: CommunityOperationDto,
  ) {
    const communityRelation = new this.communityRelationModel({
      locationId: object.id,
      communityId: communityOperationDto.communityId,
    });

    try {
      const result = await communityRelation.save();

      return result.id;
    } catch (err) {
      throw new MicrosserviceException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async deleteCommunityRelation(id: string) {
    const deletedDocument = await this.communityRelationModel.findOneAndDelete({
      locationId: id,
    });

    return !!deletedDocument;
  }

  async addToCommunity(communityOperationDto: CommunityOperationDto) {
    const locationObject = await this.getPointOrArea(
      communityOperationDto.locationId,
    );

    if (locationObject === null) {
      throw new MicrosserviceException(
        'Ponto ou Área não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.addCommunityRelation(locationObject, communityOperationDto);
  }

  async getCommunityData(communityId: string) {
    const communityDataDto = new CommunityDataDto();

    const relations = await this.communityRelationModel.find({
      communityId: communityId,
    });
    for (const relation of relations) {
      const locationObject = await this.getPointOrAreaWithMedia(
        relation.locationId,
      );
      if (locationObject instanceof PointDto) {
        communityDataDto.points.push(locationObject);
      }

      if (locationObject instanceof AreaDto) {
        communityDataDto.areas.push(locationObject);
      }
    }

    return communityDataDto;
  }

  async getMidiaFromPoint(pointid: string) {
    const relations = await this.mediaRelationModel.find({
      locationId: pointid,
    });

    return relations;
  }
}
