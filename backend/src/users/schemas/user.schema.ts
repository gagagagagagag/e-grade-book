import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { BaseSchema } from '../../utils/base.schema'

export type UserDocument = User & Document

export enum UserRoles {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
  Parent = 'parent',
}

export abstract class UserBase extends BaseSchema {
  email: string

  passwordInitiated: boolean

  password?: string

  role: UserRoles
}

@Schema({ discriminatorKey: 'role' })
export class User extends UserBase {
  @Prop({ unique: true })
  email: string

  @Prop({ default: false })
  passwordInitiated: boolean

  @Prop({ required: false, select: false })
  password?: string

  @Prop({ enum: UserRoles, required: true })
  role: UserRoles
}

export const UserSchema = SchemaFactory.createForClass(User)
