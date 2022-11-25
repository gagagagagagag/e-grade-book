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
import {
  GROUP_NOT_FOUND,
  PARENT_NOT_FOUND,
  ROLE_INVALID,
  STUDENT_NOT_FOUND,
  TEACHER_NOT_FOUND,
  USER_NOT_FOUND,
} from '../utils/validation-errors'

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
      throw new NotFoundException(USER_NOT_FOUND)
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
      throw new BadRequestException(
        `Wszyscy użytkownicy muszą mieć rolę ${role}`
      )
    }
  }

  async assertGroupAssignedToUser(userId: string, groupId: string) {
    const teacher = await this.findUserWithRole<TeacherUser>(
      userId,
      UserRoles.Teacher
    )

    if (!teacher) {
      throw new NotFoundException(TEACHER_NOT_FOUND)
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
      throw new NotFoundException(USER_NOT_FOUND)
    }

    const target = await this.findOneById(targetId)

    if (!target) {
      throw new NotFoundException('Nauczyciel/rodzic nie znaleziony')
    }

    switch (target.role) {
      case UserRoles.Teacher:
        const teacherTarget = target as TeacherUser
        if (considerGroups) {
          const teacherGroups = teacherTarget.groups
          const users = await this.groupsService.getUsersFromGroups(
            teacherGroups ?? []
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
        throw new BadRequestException(
          'Podane ID nie należy do nauczyciela i rodzica'
        )
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
      throw new NotFoundException(USER_NOT_FOUND)
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

  async getAllUsers(
    role: UserRoles,
    flags: {
      notContainingStudents?: string[]
      notContainingGroups?: string[]
      notAssignedToTeacher?: string
      notAssignedToParent?: string
    } = {}
  ) {
    const queryBuilder = new QueryBuilder()

    queryBuilder.add({ role })

    switch (role) {
      case UserRoles.Admin:
        queryBuilder.throwErrors(
          Boolean(flags.notContainingStudents),
          Boolean(flags.notContainingGroups),
          Boolean(flags.notAssignedToTeacher),
          Boolean(flags.notAssignedToParent)
        )
        break
      case UserRoles.Teacher:
        queryBuilder.throwErrors(
          Boolean(flags.notAssignedToTeacher),
          Boolean(flags.notAssignedToParent)
        )
        break
      case UserRoles.Parent:
        queryBuilder.throwErrors(
          Boolean(flags.notContainingGroups),
          Boolean(flags.notAssignedToTeacher),
          Boolean(flags.notAssignedToParent)
        )
        break
      case UserRoles.Student:
        queryBuilder.throwErrors(
          Boolean(flags.notContainingStudents),
          Boolean(flags.notContainingGroups)
        )

        if (flags.notAssignedToTeacher) {
          const teacher = await this.findUserWithRole<TeacherUser>(
            flags.notAssignedToTeacher,
            UserRoles.Teacher
          )

          if (!teacher) {
            throw new NotFoundException(TEACHER_NOT_FOUND)
          }

          queryBuilder.add({ _id: { $nin: teacher.students } })
        }

        if (flags.notAssignedToParent) {
          const parent = await this.findUserWithRole<ParentUser>(
            flags.notAssignedToParent,
            UserRoles.Parent
          )

          if (!parent) {
            throw new NotFoundException(PARENT_NOT_FOUND)
          }

          queryBuilder.add({ _id: { $nin: parent.students } })
        }
        break
      default:
        throw new BadRequestException(ROLE_INVALID)
    }

    queryBuilder.add(
      flags.notContainingStudents && {
        students: { $nin: flags.notContainingStudents },
      },
      flags.notContainingGroups && {
        groups: { $nin: flags.notContainingGroups },
      }
    )

    return this.userModel.find(queryBuilder.getQuery(), null, { lean: true })
  }

  async getMyUsers(currentUser: User) {
    const teacherUser = currentUser as TeacherUser
    return this.userModel.find({ _id: { $in: teacherUser.students } })
  }

  async assignGroup(teacherId: string, groupId: string, add: boolean) {
    const group = await this.groupsService.findOneById(groupId)

    if (!group) {
      throw new NotFoundException(GROUP_NOT_FOUND)
    }

    const teacher = await this.findUserWithRole<TeacherUser>(
      teacherId,
      UserRoles.Teacher
    )

    if (!teacher) {
      throw new NotFoundException(TEACHER_NOT_FOUND)
    }

    return this.teachersService.assignGroup(teacherId, groupId, add)
  }

  async assignStudent(targetId: string, studentId: string, add: boolean) {
    const student = await this.findUserWithRole<StudentUser>(
      studentId,
      UserRoles.Student
    )

    if (!student) {
      throw new NotFoundException(STUDENT_NOT_FOUND)
    }

    const target = await this.findOneById(targetId)

    if (!target) {
      throw new NotFoundException('Nauczyciel/rodzic nie znaleziony')
    }

    switch (target.role) {
      case UserRoles.Teacher:
        return this.teachersService.assignStudent(targetId, studentId, add)
      case UserRoles.Parent:
        return this.parentsService.assignStudent(targetId, studentId, add)
      default:
        throw new BadRequestException(
          'Przypisanie jest możliwe tylko dla nauczyciela i rodzica'
        )
    }
  }
}
