import { Schema, SchemaFactory } from '@nestjs/mongoose'

import { User, UserRoles } from './user.schema'

@Schema()
export class StudentUser extends User {
  role: UserRoles.Student
}

export const StudentUserSchema = SchemaFactory.createForClass(StudentUser)
