export class CreatePointDto {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  validated: boolean;
  member: string;
}
