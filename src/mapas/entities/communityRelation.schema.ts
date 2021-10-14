import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommunityRelationDocument = CommunityRelation & Document;

@Schema()
export class CommunityRelation {
  @Prop()
  communityId: string;

  @Prop()
  locationId: string;
}

export const CommunityRelationSchema =
  SchemaFactory.createForClass(CommunityRelation);

CommunityRelationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CommunityRelationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});
