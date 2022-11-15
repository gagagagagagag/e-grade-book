import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User, UserDocument, UserRoles } from './schemas'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  create(email: string, role: UserRoles): Promise<User> {
    const user = new this.userModel({ email, role })

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
    selection: string = ''
  ): Promise<User | null> {
    if (!email) {
      return null
    }

    return this.userModel.findOne({ email }, selection).exec()
  }
}
