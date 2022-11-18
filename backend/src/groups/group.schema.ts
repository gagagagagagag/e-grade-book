import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

import { BaseSchema } from '../utils'

export type GroupDocument = Group & Document

@Schema()
export class Group extends BaseSchema {
  @Prop({ required: true, index: 'text' })
  name: string

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students?: string[]
}

export const GroupSchema = SchemaFactory.createForClass(Group)
