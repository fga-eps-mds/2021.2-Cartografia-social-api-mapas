export class CreateAreaDto {
  title: string;
  description?: string;
  coordinates: Coordinates[];
  validated: boolean;
  member: string;
  color: string;
}

class Coordinates {
  latitude: number;
  longitude: number;
}
