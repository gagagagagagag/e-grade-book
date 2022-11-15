import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import {
  User,
  UserSchema,
  AdminUser,
  AdminUserSchema,
  TeacherUser,
  TeacherUserSchema,
  StudentUser,
  StudentUserSchema,
  ParentUser,
  ParentUserSchema,
} from './schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          {
            name: AdminUser.name,
            schema: AdminUserSchema,
          },
          {
            name: TeacherUser.name,
            schema: TeacherUserSchema,
          },
          {
            name: StudentUser.name,
            schema: StudentUserSchema,
          },
          {
            name: ParentUser.name,
            schema: ParentUserSchema,
          },
        ],
      },
    ]),
  ],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
