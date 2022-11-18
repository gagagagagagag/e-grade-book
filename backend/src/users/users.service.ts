import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { PaginationOptionsDto } from '../dtos'
import { GroupsService } from '../groups/groups.service'
import { QueryBuilder } from '../utils'
import { ParentsService } from './parents.service'
import { TeachersService } from './teachers.service'
import {
  AdminUser,
  ParentUser,
  StudentUser,
  TeacherUser,
  User,
  UserDocument,
  UserRoles,
} from './schemas'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    private readonly teachersService: TeachersService,
    private readonly parentsService: ParentsService
  ) {}

  create(
    name: string,
    email: string,
    role: UserRoles,
    password?: string
  ): Promise<User> {
    const user = new this.userModel({
      name,
      email,
      role,
      password,
      passwordInitiated: Boolean(password),
    })

    return user.save()
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, attrs, {
      new: true,
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findOneById(id: string | null): Promise<User | null> {
    if (!id) {
      return null
    }

    return this.userModel.findById(id).exec()
  }

  async findOneByEmail(
    email: string | null,
    selection = ''
  ): Promise<User | null> {
    if (!email) {
      return null
    }

    return this.userModel.findOne({ email }, selection).exec()
  }

  async findUserWithRole<
    T extends AdminUser | TeacherUser | ParentUser | StudentUser
  >(id: string | null, role: UserRoles) {
    const user = await this.userModel.findOne({ _id: id, role }).exec()

    if (!user) {
      return null
    }

    return user as unknown as T
  }

  async countUsersWithRole(userIds: string[], role: UserRoles) {
    if (userIds.length === 0) {
      return 0
    }

    return this.userModel.countDocuments({
      role: { $eq: role },
      _id: { $in: userIds },
    })
  }

  async assertUsersHaveRole(userIds: string[], role: UserRoles) {
    const count = await this.countUsersWithRole(userIds, role)

    if (count !== userIds.length) {
      throw new BadRequestException(`All users have to be of type ${role}`)
    }
  }

  async assertGroupAssignedToUser(userId: string, groupId: string) {
    const teacher = await this.findUserWithRole<TeacherUser>(
      userId,
      UserRoles.Teacher
    )

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    await this.teachersService.assertGroupAssignedToTeacher(teacher.id, groupId)
  }

  async assertUserAssignedToUser(
    targetId: string,
    userId: string,
    considerGroups = false
  ) {
    const user = await this.findUserWithRole(userId, UserRoles.Student)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const target = await this.findOneById(targetId)

    if (!target) {
      throw new NotFoundException('Target not found')
    }

    switch (target.role) {
      case UserRoles.Teacher:
        const teacherTarget = target as TeacherUser
        if (considerGroups) {
          const teacherGroups = teacherTarget.groups as unknown as string[]
          const users = await this.groupsService.getUsersFromGroups(
            teacherGroups
          )

          if (users.includes(userId)) {
            return
          }
        }

        return this.teachersService.assertUserAssignedToTeacher(
          targetId,
          userId
        )
      case UserRoles.Parent:
        return this.parentsService.assertUserAssignedToParent(targetId, userId)
      default:
        throw new BadRequestException('Target is not a teacher nor a parent')
    }
  }

  async getUser(id: string, currentUser: User) {
    const queryBuilder = new QueryBuilder({ _id: id })

    if (
      currentUser.role === UserRoles.Teacher ||
      currentUser.role === UserRoles.Parent
    ) {
      await this.assertUserAssignedToUser(currentUser.id, id, true)
    }

    queryBuilder.add(
      currentUser.role === UserRoles.Student && { _id: currentUser.id }
    )

    const user = this.userModel.findOne(queryBuilder.getQuery()).exec()

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async getUsers(
    paginationOptions: PaginationOptionsDto,
    filters: {
      role?: UserRoles
    }
  ) {
    const queryBuilder = new QueryBuilder(paginationOptions.getBaseQuery())

    queryBuilder.add(filters.role && { role: filters.role })

    const data = await this.userModel.find(
      queryBuilder.getQuery(),
      null,
      paginationOptions.createFindOptions()
    )

    const count = await this.userModel.countDocuments(queryBuilder.getQuery())

    return paginationOptions.createResponse(data, count)
  }

  async assignGroup(teacherId: string, groupId: string, add: boolean) {
    const group = await this.groupsService.findOneById(groupId)

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    const teacher = await this.findUserWithRole<TeacherUser>(
      teacherId,
      UserRoles.Teacher
    )

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    return this.teachersService.assignGroup(teacherId, groupId, add)
  }

  async assignStudent(targetId: string, studentId: string, add: boolean) {
    const student = await this.findUserWithRole<StudentUser>(
      studentId,
      UserRoles.Student
    )

    if (!student) {
      throw new NotFoundException('Student not found')
    }

    const target = await this.findOneById(targetId)

    if (!target) {
      throw new NotFoundException('Target not found')
    }

    switch (target.role) {
      case UserRoles.Teacher:
        return this.teachersService.assignStudent(targetId, studentId, add)
      case UserRoles.Parent:
        return this.parentsService.assignStudent(targetId, studentId, add)
      default:
        throw new BadRequestException('Target has to be a teacher or a parent')
    }
  }
}
