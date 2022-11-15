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

@Schema({ discriminatorKey: 'role' })
export class User extends BaseSchema {
  @Prop({ unique: true })
  email: string

  @Prop({ default: false })
  passwordInitialized: boolean

  @Prop({ select: false, default: null })
  password: string | null

  @Prop({ enum: UserRoles, required: true })
  role: UserRoles
}

export const UserSchema = SchemaFactory.createForClass(User)
