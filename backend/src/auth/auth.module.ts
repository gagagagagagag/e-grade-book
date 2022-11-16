import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { MailerModule } from '../mailer/mailer.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy, LocalStrategy } from './strategies'
import { TokenService } from './token.service'

@Module({
  imports: [
    MailerModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  exports: [TokenService],
  providers: [AuthService, LocalStrategy, JwtStrategy, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
