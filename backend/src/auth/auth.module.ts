import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { MailerModule } from '../mailer/mailer.module'
import { RolesGuard } from './guards'
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
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
