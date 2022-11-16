import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersModule } from '../users/users.module'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { Group, GroupSchema } from './group.schema'

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
