import { AreaDto } from './area.dto';
import { PointDto } from './point.dto';

export class CommunityDataDto {
  points: PointDto[] = [];
  areas: AreaDto[] = [];
}
