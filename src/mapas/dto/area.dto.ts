import { MediaRelationDocument } from '../entities/mediaRelation.schema';
import { AreaDocument } from '../entities/area.schema';

export class AreaDto {
  static convertFromAreaDocument(area: AreaDocument) {
    const newAreaDto = new AreaDto();

    newAreaDto.title = area.title;
    newAreaDto.description = area.description;
    newAreaDto.type = area.type;
    newAreaDto.coordinates = area.coordinates;

    return newAreaDto;
  }

  // these values will be initialized from a AreaDocument
  title: string;
  description?: string;
  type = 'Polygon';
  coordinates: number[][][];
  medias: MediaRelationDocument[] = []; //initialize as empty list
}
