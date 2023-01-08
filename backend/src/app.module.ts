import { Module, ValidationPipe } from '@nestjs/common'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MailerModule } from './mailer/mailer.module'
import { GroupsModule } from './groups/groups.module'
import { LessonsModule } from './lessons/lessons.module'
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: `mongodb://${config.getOrThrow<string>(
          'DB_USERNAME'
        )}:${config.getOrThrow<string>(
          'DB_PASSWORD'
        )}@${config.getOrThrow<string>('DB_HOST')}:${config.getOrThrow<string>(
          'DB_PORT'
        )}/${config.getOrThrow<string>(
          'DB_DATABASE'
        )}?authSource=admin&authMechanism=SCRAM-SHA-256`,
      }),
    }),
    UsersModule,
    AuthModule,
    MailerModule,
    GroupsModule,
    LessonsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
