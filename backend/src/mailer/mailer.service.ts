import { Injectable } from '@nestjs/common'
import { MailerService as _MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export enum EmailTemplates {
  Welcome = 'welcome',
}

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: _MailerService,
    private readonly configService: ConfigService
  ) {}

  private async sendEmail(
    to: string,
    subject: string,
    template: EmailTemplates,
    context?: object
  ) {
    this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    })
  }

  async sendWelcomeEmail(email: string, token: string) {
    await this.sendEmail(email, 'Welcome!', EmailTemplates.Welcome, {
      initPassUrl: `${this.configService.getOrThrow<string>(
        'APP_URL'
      )}/initPassword?token=${token}`,
    })
  }
}
