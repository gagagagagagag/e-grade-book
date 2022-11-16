import { Schema, SchemaFactory } from '@nestjs/mongoose'

import { UserBase, UserRoles } from './user.schema'

@Schema()
export class AdminUser extends UserBase {
  role: UserRoles.Admin
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser)
