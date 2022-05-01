import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AreaDocument = Area & Document;

@Schema()
export class Area {
  @Prop()
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: String })
  type = 'Polygon';

  @Prop()
  coordinates: number[][][];

  @Prop()
  validated: boolean;

  @Prop()
  member: string;
}

export const AreaSchema = SchemaFactory.createForClass(Area);

AreaSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

AreaSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});
