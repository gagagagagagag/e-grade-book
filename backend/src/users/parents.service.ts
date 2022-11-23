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

  async assertUserAssignedToParent(parentId: string, userId: string) {
    const parent = await this.parentUserModel.findOne({
      _id: parentId,
      students: { $eq: userId },
    })

    if (!parent) {
      throw new BadRequestException('Uczeń nie jest przypisany do rodzica')
    }
  }

  async assignStudent(parentId: string, studentId: string, add: boolean) {
    const result = await this.parentUserModel.updateOne(
      {
        _id: parentId,
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
          ? 'Uczeń już jest przypisany do nauczyciela'
          : 'Uczeń nie jest przypisany do nauczyciela'
      )
    }

    return true
  }
}
