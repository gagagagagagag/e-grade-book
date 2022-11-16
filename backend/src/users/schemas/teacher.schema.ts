import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

import { Group } from '../../groups/group.schema'
import { StudentUser } from './student.schema'
import { UserBase, UserRoles } from './user.schema'

export type TeacherUserDocument = TeacherUser & Document

@Schema()
export class TeacherUser extends UserBase {
  role: UserRoles.Teacher

  @Prop({ type: Types.ObjectId, ref: StudentUser.name })
  students: StudentUser[]

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groups: Group[]
}

export const TeacherUserSchema = SchemaFactory.createForClass(TeacherUser)
