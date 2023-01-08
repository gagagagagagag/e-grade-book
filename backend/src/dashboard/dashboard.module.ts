import { Module } from '@nestjs/common'

import { LessonsModule } from '../lessons/lessons.module'
import { UsersModule } from '../users/users.module'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [LessonsModule, UsersModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
