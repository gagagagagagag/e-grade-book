import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

import { UserBase, UserRoles } from './user.schema'

export type TeacherUserDocument = TeacherUser & Document

@Schema()
export class TeacherUser extends UserBase {
  role: UserRoles.Teacher

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students: string[]

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groups: string[]
}

export const TeacherUserSchema = SchemaFactory.createForClass(TeacherUser)
