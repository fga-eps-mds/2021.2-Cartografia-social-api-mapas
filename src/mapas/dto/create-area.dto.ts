export class CreateAreaDto {
  title: string;
  description?: string;
  coordinates: Coordinates[];
}

class Coordinates {
  latitude: number;
  longitude: number;
}
