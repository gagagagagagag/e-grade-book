import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { User, UserDocument } from './user.schema'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let fakeUserModel: Partial<Model<UserDocument>>

  beforeEach(async () => {
    fakeUserModel = {}

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: fakeUserModel,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
