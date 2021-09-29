import { MediaRelationDocument } from '../entities/mediaRelation.schema';
import { PointDocument } from '../entities/point.schema';

export class PointDto {
  static convertFromPointDocument(point: PointDocument) {
    const newPointDto = new PointDto();

    newPointDto.title = point.title;
    newPointDto.description = point.description;
    newPointDto.type = point.type;
    newPointDto.coordinates = point.coordinates;

    return newPointDto;
  }

  // these values will be initialized from a PointDocument
  title: string;
  description?: string;
  type: string;
  coordinates: number[];

  medias: MediaRelationDocument[] = []; //initialize as empty list
}
