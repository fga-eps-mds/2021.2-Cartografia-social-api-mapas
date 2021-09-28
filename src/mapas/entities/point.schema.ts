import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PointDocument = Point & Document;

@Schema()
export class Point {
  @Prop()
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: String })
  type = 'Point';

  @Prop()
  coordinates: number[];
}

export const PointSchema = SchemaFactory.createForClass(Point);
