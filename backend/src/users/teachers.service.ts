import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TeacherUser, TeacherUserDocument } from './schemas'

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(TeacherUser.name)
    private readonly teacherUserModel: Model<TeacherUserDocument>
  ) {}

  async assertGroupAssignedToTeacher(teacherId: string, groupId: string) {
    const teacher = await this.teacherUserModel.findOne({
      _id: teacherId,
      groups: { $eq: groupId },
    })

    if (!teacher) {
      throw new BadRequestException('Group is not assigned to teacher')
    }
  }

  async assertUserAssignedToTeacher(teacherId: string, userId: string) {
    const teacher = await this.teacherUserModel.findOne({
      _id: teacherId,
      students: { $eq: userId },
    })

    if (!teacher) {
      throw new BadRequestException('Student is not assigned to teacher')
    }
  }

  async assignGroup(teacherId: string, groupId: string, add: boolean) {
    const result = await this.teacherUserModel.updateOne(
      {
        id: teacherId,
        groups: add ? { $ne: groupId } : { $eq: groupId },
      },
      add
        ? {
            $push: { groups: groupId },
          }
        : {
            $pull: { groups: groupId },
          },
      {
        new: true,
      }
    )

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        add
          ? 'Group is already assigned to the teacher'
          : 'Group is not assigned to the teacher'
      )
    }

    return true
  }

  async assignStudent(teacherId: string, studentId: string, add: boolean) {
    const result = await this.teacherUserModel.updateOne(
      {
        _id: teacherId,
        students: add ? { $ne: studentId } : { $eq: studentId },
      },
      add
        ? { $push: { students: studentId } }
        : { $pull: { students: studentId } },
      { new: true }
    )

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        add
          ? 'User is already assigned to the teacher'
          : 'User is not assigned to the teacher'
      )
    }

    return true
  }
}
