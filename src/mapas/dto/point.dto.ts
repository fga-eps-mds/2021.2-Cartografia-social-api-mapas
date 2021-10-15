import { MediaRelationDocument } from '../entities/mediaRelation.schema';
import { PointDocument } from '../entities/point.schema';

export class PointDto {
  static convertFromPointDocument(point: PointDocument) {
    const newPointDto = new PointDto();

    newPointDto.id = point.id;
    newPointDto.title = point.title;
    newPointDto.description = point.description;
    newPointDto.coordinates = point.coordinates;

    return newPointDto;
  }

  // these values will be initialized from a PointDocument
  id: string;
  title: string;
  description?: string;
  type = 'Point';
  coordinates: number[];
  medias: MediaRelationDocument[] = []; //initialize as empty list
}
