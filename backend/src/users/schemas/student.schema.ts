import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserBase, UserRoles } from './user.schema'

export type StudentUserDocument = StudentUser & Document
@Schema()
export class StudentUser extends UserBase {
  role: UserRoles.Student
}

export const StudentUserSchema = SchemaFactory.createForClass(StudentUser)
