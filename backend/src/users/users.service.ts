import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { PaginationOptionsDto } from '../dtos'
import { ParentsService } from './parents.service'
import { User, UserDocument, UserRoles } from './schemas'
import { TeachersService } from './teachers.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  async getUser(id: string, userRole: UserRoles) {
    // check what type the requested user is
    // check if the current user can request this user
    // return data that this user is allowed to see
    console.log(id, userRole)
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

  async assignStudent(targetId: string, studentId: string, add: boolean) {
    const student = await this.findOneById(studentId)

    if (!student) {
      throw new NotFoundException('Student not found')
    }

    if (student.role !== UserRoles.Student) {
      throw new BadRequestException('studentId is not a student')
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
