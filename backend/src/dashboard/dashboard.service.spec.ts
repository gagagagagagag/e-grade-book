import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { LessonsService } from '../lessons/lessons.service'
import { UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { DashboardService } from './dashboard.service'

describe('DashboardService', () => {
  let service: DashboardService
  let fakeLessonsService: Partial<LessonsService>
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    fakeLessonsService = {
      getLessonStats: jest.fn(),
    }
    fakeUsersService = {
      assertGroupAssignedToUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LessonsService,
          useValue: fakeLessonsService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        DashboardService,
      ],
    }).compile()

    service = module.get<DashboardService>(DashboardService)
  })

  const groupId = 'groupId'
  const userId = 'userId'

  describe('#getGroupDashboard', () => {
    it('should throw if groupId is not provided', async () => {
      await expect(service.getGroupDashboard(true as any)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should check if the group is assigned to the teacher', async () => {
      await service.getGroupDashboard(
        { role: UserRoles.Teacher } as any,
        groupId
      )

      expect(fakeUsersService.assertGroupAssignedToUser).toHaveBeenCalled()
    })

    it('should not check if the group is assigned for the admin', async () => {
      await service.getGroupDashboard({ role: UserRoles.Admin } as any, groupId)

      expect(fakeUsersService.assertGroupAssignedToUser).not.toHaveBeenCalled()
      expect(fakeLessonsService.getLessonStats).toHaveBeenCalled()
    })
  })

  describe('#getUserDashboard', () => {
    it('should throw if a student provides a userId', async () => {
      await expect(
        service.getUserDashboard({ role: UserRoles.Student } as any, userId)
      ).rejects.toThrow(BadRequestException)
    })

    it("should throw if a parent doesn't provide a userId", async () => {
      await expect(
        service.getUserDashboard({ role: UserRoles.Parent } as any)
      ).rejects.toThrow(BadRequestException)
    })

    it('should not limit the stats for admin', async () => {
      await service.getUserDashboard({ role: UserRoles.Admin } as any)

      expect(fakeLessonsService.getLessonStats).toHaveBeenCalledWith(
        expect.objectContaining({
          teacher: null,
          student: null,
          group: null,
        })
      )
    })
  })
})
