import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MailerModule } from './mailer/mailer.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
