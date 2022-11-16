import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ParentUser, ParentUserDocument } from './schemas'

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(ParentUser.name)
    private readonly parentUserModel: Model<ParentUserDocument>
  ) {}

  async assignStudent(parentId: string, studentId: string, add: boolean) {
    const result = await this.parentUserModel.updateOne(
      { id: parentId, students: add ? { $ne: studentId } : { $eq: studentId } },
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
