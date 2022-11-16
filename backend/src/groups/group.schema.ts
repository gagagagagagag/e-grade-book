import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

import { StudentUser, TeacherUser } from '../users/schemas'
import { BaseSchema } from '../utils'

export type GroupDocument = Group & Document

@Schema()
export class Group extends BaseSchema {
  @Prop({ required: true })
  name: string

  @Prop({ type: Types.ObjectId, ref: TeacherUser.name, required: true })
  teacher: TeacherUser

  @Prop({ type: Types.ObjectId, ref: StudentUser.name })
  students: StudentUser[]
}

export const GroupSchema = SchemaFactory.createForClass(Group)