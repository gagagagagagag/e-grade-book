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
import { ParentsService } from './parents.service'
import {
  AdminUser,
  ParentUser,
  StudentUser,
  TeacherUser,
  User,
  UserDocument,
  UserRoles,
} from './schemas'
import { TeachersService } from './teachers.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    private readonly teachersService: TeachersService,
    private readonly parentsService: ParentsService
  ) {}

  create(name: string, email: string, role: UserRoles): Promise<User> {
    const user = new this.userModel({ name, email, role })

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

  async assertUserAssignedToUser(targetId: string, userId: string) {
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

  async getUser(id: string, currentUserRole: UserRoles) {
    // check what type the requested user is
    // check if the current user can request this user
    // return data that this user is allowed to see
    console.log(id, currentUserRole)
  }

  async getUsers(
    paginationOptions: PaginationOptionsDto,
    filters: {
      role?: UserRoles
    }
  ) {
    let query = paginationOptions.getBaseQuery()

    if (filters.role) {
      query = {
        ...query,
        role: { $eq: filters.role },
      }
    }

    const data = await this.userModel.find(query, null, {
      skip: paginationOptions.skip,
      limit: paginationOptions.limit,
      sort: paginationOptions.sort,
    })

    const count = await this.userModel.countDocuments(query)

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
