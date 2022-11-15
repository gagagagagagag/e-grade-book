import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  let fakeAuthService: Partial<AuthService>
  let fakeConfigService: Partial<ConfigService>

  beforeEach(async () => {
    const payload = {
      accessToken: 'access',
      refreshToken: 'refresh',
    }

    fakeAuthService = {
      refreshToken: () => Promise.resolve(payload),
      signup: () => Promise.resolve(true),
      login: () => Promise.resolve(payload),
      changePassword: () => Promise.resolve(true),
    }
    fakeConfigService = {
      getOrThrow: () => '453hbj4',
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
      ],
      controllers: [AuthController],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
