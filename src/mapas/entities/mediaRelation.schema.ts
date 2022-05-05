import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaRelationDocument = MediaRelation & Document;

@Schema()
export class MediaRelation {
  @Prop()
  mediaId: string;

  @Prop()
  locationId: string;
}

export const MediaRelationSchema = SchemaFactory.createForClass(MediaRelation);

MediaRelationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

MediaRelationSchema.virtual('dateAdded').get(function () {
  return this._id.getTimestamp();
});

MediaRelationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});
