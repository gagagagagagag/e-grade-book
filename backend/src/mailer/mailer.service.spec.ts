import { Test, TestingModule } from '@nestjs/testing'
import { MailerService as _MailerService } from '@nestjs-modules/mailer'
import { EmailTemplates, MailerService } from './mailer.service'

describe('MailerService', () => {
  let service: MailerService
  let fakeMailerService: Partial<_MailerService>

  beforeEach(async () => {
    fakeMailerService = {
      sendMail: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: _MailerService,
          useValue: fakeMailerService,
        },
      ],
    }).compile()

    service = module.get<MailerService>(MailerService)
  })

  it('should send verification email containing the link to verify the email', async () => {
    await service.sendVerifyEmailAddress(
      'test@test.com',
      'test_token',
      'server_url'
    )

    expect(fakeMailerService.sendMail).toHaveBeenCalledTimes(1)
    expect(fakeMailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        template: EmailTemplates.VerifyEmail,
        context: expect.objectContaining({
          verifyLink: expect.stringContaining('test_token'),
        }),
      })
    )
  })

  it('should send a welcome email', async () => {
    await service.sendWelcomeEmail('test@test.com')

    expect(fakeMailerService.sendMail).toHaveBeenCalledTimes(1)
    expect(fakeMailerService.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        template: EmailTemplates.Welcome,
      })
    )
  })
})
