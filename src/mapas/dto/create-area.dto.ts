export class CreateAreaDto {
  title: string;
  description?: string;
  coordinates: Coordinates[];
  validated: boolean;
}

class Coordinates {
  latitude: number;
  longitude: number;
}
