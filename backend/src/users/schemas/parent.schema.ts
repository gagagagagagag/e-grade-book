import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

import { UserRoles, UserBase } from './user.schema'

export type ParentUserDocument = ParentUser & Document

@Schema()
export class ParentUser extends UserBase {
  role: UserRoles.Parent

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  students: string[]
}

export const ParentUserSchema = SchemaFactory.createForClass(ParentUser)
