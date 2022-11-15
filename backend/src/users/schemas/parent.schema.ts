import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { StudentUser } from './student.schema'
import { UserRoles, UserBase } from './user.schema'

@Schema()
export class ParentUser extends UserBase {
  role: UserRoles.Parent

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students: StudentUser[]
}

export const ParentUserSchema = SchemaFactory.createForClass(ParentUser)
