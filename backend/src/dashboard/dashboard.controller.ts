import { Controller, Get, Query } from '@nestjs/common'

import { CurrentUser, IsAuthenticated, IsTeacher } from '../auth/decorators'
import { User } from '../users/schemas'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @IsAuthenticated()
  @Get('/user')
  getUserDashboard(@CurrentUser() currentUser: User, @Query('id') id?: string) {
    return this.dashboardService.getUserDashboard(currentUser, id)
  }

  @IsTeacher()
  @Get('/group')
  getGroupDashboard(
    @CurrentUser() currentUser: User,
    @Query('id') id?: string
  ) {
    return this.dashboardService.getGroupDashboard(currentUser, id)
  }
}
