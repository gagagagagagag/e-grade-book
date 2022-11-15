import { Schema, SchemaFactory } from '@nestjs/mongoose'

import { User, UserRoles } from './user.schema'

@Schema()
export class AdminUser extends User {
  role: UserRoles.Admin
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser)
