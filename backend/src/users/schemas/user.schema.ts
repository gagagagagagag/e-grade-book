import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { BaseSchema } from '../../utils/base.schema'

export type UserDocument = User & Document

export enum UserRoles {
  Admin = 'AdminUser',
  Teacher = 'TeacherUser',
  Student = 'StudentUser',
  Parent = 'ParentUser',
}

export abstract class UserBase extends BaseSchema {
  name: string

  email: string

  passwordInitiated: boolean

  password?: string

  role: UserRoles

  lastLogin?: Date
}

@Schema({ discriminatorKey: 'role' })
export class User extends UserBase {
  @Prop({ required: true, index: 'text' })
  name: string

  @Prop({ unique: true })
  email: string

  @Prop({ required: false })
  lastLogin?: Date

  @Prop({ default: false })
  passwordInitiated: boolean

  @Prop({ required: false, select: false })
  password?: string

  @Prop({ enum: UserRoles, required: true })
  role: UserRoles
}

export const UserSchema = SchemaFactory.createForClass(User)
