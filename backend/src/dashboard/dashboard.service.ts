import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { LessonsService } from '../lessons/lessons.service'
import { User, UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { QueryBuilder } from '../utils'

@Injectable()
export class DashboardService {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly usersService: UsersService
  ) {}

  async getGroupDashboard(currentUser: User, groupId?: string) {
    if (!groupId) {
      throw new BadRequestException('ID grupy jest wymagane')
    }

    const queryBuilder = new QueryBuilder({
      teacher: null,
      student: null,
      group: groupId,
    })

    if (currentUser.role === UserRoles.Teacher) {
      await this.usersService.assertGroupAssignedToUser(currentUser.id, groupId)
    }

    this.lessonsService.getLessonStats(queryBuilder.getQuery())
  }

  async getUserDashboard(currentUser: User, userId?: string) {
    if (currentUser.role === UserRoles.Student && Boolean(userId)) {
      throw new BadRequestException('Nie masz dostępu do tego użytkownika')
    }
    if (!userId && currentUser.role === UserRoles.Parent) {
      throw new BadRequestException('Rodzic musi określić id swojego dziecka')
    }

    const queryBuilder = new QueryBuilder({
      teacher: null,
      student: null,
      group: null,
    })

    if (userId) {
      const user = await this.usersService.findOneById(userId)

      if (!user) {
        throw new NotFoundException('Użytkownik nie został znaleziony')
      }

      if (user.role === UserRoles.Admin || user.role === UserRoles.Parent) {
        throw new BadRequestException('Admin i rodzic nie są wspierani')
      } else if (user.role === UserRoles.Teacher) {
        if (currentUser.role !== UserRoles.Admin) {
          throw new BadRequestException('Nie masz dostępu do tego użytkownika')
        } else {
          queryBuilder.add({ teacher: user.id })
        }
      } else {
        if (
          currentUser.role === UserRoles.Teacher ||
          currentUser.role === UserRoles.Parent
        ) {
          await this.usersService.assertUserAssignedToUser(
            currentUser.id,
            user.id,
            true
          )
        }

        queryBuilder.add({ student: user.id })
      }
    } else {
      if (currentUser.role === UserRoles.Teacher) {
        queryBuilder.add({ teacher: currentUser.id })
      } else if (currentUser.role === UserRoles.Student) {
        queryBuilder.add({ student: currentUser.id })
      }
    }

    return {
      lessons: await this.lessonsService.getLessonStats(
        queryBuilder.getQuery()
      ),
    }
  }
}
