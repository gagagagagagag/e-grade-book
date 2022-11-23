import { Test, TestingModule } from '@nestjs/testing'
import { MailerService as _MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

import { EmailTemplates, MailerService } from './mailer.service'

describe('MailerService', () => {
  const fakeConfig = 'test'
  let service: MailerService
  let fakeMailerService: Partial<_MailerService>
  let fakeConfigService: Partial<ConfigService>

  beforeEach(async () => {
    fakeMailerService = {
      sendMail: jest.fn(),
    }
    fakeConfigService = {
      getOrThrow: jest.fn().mockReturnValue(fakeConfig),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: _MailerService,
          useValue: fakeMailerService,
        },
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
      ],
    }).compile()

    service = module.get<MailerService>(MailerService)
  })

  const email = 'test@test.com'
  const token = 'token'

  it('should send a welcome email', async () => {
    await service.sendWelcomeEmail(email, token)

    expect(fakeMailerService.sendMail).toHaveBeenCalledTimes(1)
    expect(fakeMailerService.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.anything(),
        template: EmailTemplates.Welcome,
        context: {
          initPassUrl: `${fakeConfig}/initPassword?token=${token}`,
        },
      })
    )
  })

  it('should send the reset password email', async () => {
    await service.sendResetPasswordEmail(email, token)

    expect(fakeMailerService.sendMail).toHaveBeenCalledTimes(1)
  })
})
