import { Schema, SchemaFactory } from '@nestjs/mongoose'

import { UserBase, UserRoles } from './user.schema'

@Schema()
export class StudentUser extends UserBase {
  role: UserRoles.Student
}

export const StudentUserSchema = SchemaFactory.createForClass(StudentUser)
