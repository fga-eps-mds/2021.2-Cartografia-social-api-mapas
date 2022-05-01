export class CreateAreaDto {
  title: string;
  description?: string;
  coordinates: Coordinates[];
  validated: boolean;
  member: string;
}

class Coordinates {
  latitude: number;
  longitude: number;
}
