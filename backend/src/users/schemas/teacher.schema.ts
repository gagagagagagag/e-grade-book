import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { StudentUser } from './student.schema'
import { User, UserRoles } from './user.schema'

@Schema()
export class TeacherUser extends User {
  role: UserRoles.Teacher

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students: StudentUser[]

  // @Prop()
  // groups:
}

export const TeacherUserSchema = SchemaFactory.createForClass(TeacherUser)
