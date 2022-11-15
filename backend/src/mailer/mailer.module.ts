import { Module } from '@nestjs/common'
import { MailerModule as _MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { ConfigService } from '@nestjs/config'

import { MailerService } from './mailer.service'

@Module({
  imports: [
    _MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          host: config.getOrThrow<string>('MAILER_HOST'),
          auth: {
            user: config.getOrThrow<string>('MAILER_USER'),
            pass: config.getOrThrow<string>('MAILER_PASS'),
          },
        },
        defaults: {
          from: config.getOrThrow<string>('MAILER_USER'),
        },
        template: {
          dir: __dirname + '/templates/pages',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: __dirname + '/templates/partials',
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
  ],
  exports: [MailerService],
  providers: [MailerService],
})
export class MailerModule {}
