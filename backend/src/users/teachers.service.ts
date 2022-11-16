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

  async assignStudent(teacherId: string, studentId: string, add: boolean) {
    const result = await this.teacherUserModel.updateOne(
      {
        id: teacherId,
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
