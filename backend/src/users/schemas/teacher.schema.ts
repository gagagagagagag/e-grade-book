import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { StudentUser } from './student.schema'
import { UserBase, UserRoles } from './user.schema'

export type TeacherUserDocument = TeacherUser & Document

@Schema()
export class TeacherUser extends UserBase {
  role: UserRoles.Teacher

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students: StudentUser[]

  // @Prop()
  // groups:
}

export const TeacherUserSchema = SchemaFactory.createForClass(TeacherUser)
