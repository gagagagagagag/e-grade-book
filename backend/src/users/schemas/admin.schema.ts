import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserBase, UserRoles } from './user.schema'

export type AdminUserDocument = AdminUser & Document
@Schema()
export class AdminUser extends UserBase {
  role: UserRoles.Admin
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser)
