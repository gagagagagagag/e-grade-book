import { Model } from 'mongoose'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UsersService } from '../users/users.service'
import { TeacherUser, UserRoles } from '../users/schemas'
import { Group, GroupDocument } from './group.schema'
import { UpdateGroupDto } from './dtos'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    private readonly usersService: UsersService
  ) {}

  async findOneById(id: string | null) {
    if (!id) {
      return null
    }

    return this.groupModel.findById(id).exec()
  }

  async create(name: string, teacherId: string) {
    const teacher = await this.usersService.findUserWithRole<TeacherUser>(
      teacherId,
      UserRoles.Teacher
    )

    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    const group = new this.groupModel({ name, teacher: teacher._id })

    return group.save()
  }

  async update(id: string, attrs: UpdateGroupDto) {
    if (attrs.teacher) {
      const teacher = await this.usersService.findUserWithRole(
        attrs.teacher,
        UserRoles.Teacher
      )

      if (!teacher) {
        throw new NotFoundException('Teacher not found')
      }
    }

    if (attrs.students && attrs.students.length > 0) {
      await this.usersService.assertUsersHaveRole(
        attrs.students,
        UserRoles.Student
      )
    }

    const group = await this.groupModel.findByIdAndUpdate(id, attrs, {
      new: true,
    })

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    return group
  }

  async delete(id: string) {
    const result = await this.groupModel.findByIdAndDelete(id)

    if (!result) {
      throw new NotFoundException('Group not found')
    }

    return result
  }

  async assignStudent(groupId: string, studentId: string, add: boolean) {
    const student = await this.usersService.findUserWithRole(
      studentId,
      UserRoles.Student
    )

    if (!student) {
      throw new NotFoundException('Student not found')
    }

    const group = await this.findOneById(groupId)

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    const result = await this.groupModel.updateOne(
      {
        id: groupId,
        students: add ? { $ne: studentId } : { $eq: studentId },
      },
      add
        ? { $push: { students: studentId } }
        : { $pull: { students: studentId } },
      {
        new: true,
      }
    )

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        add
          ? 'User is already assigned to the group'
          : 'User is not assigned to the teacher'
      )
    }

    return true
  }
}
