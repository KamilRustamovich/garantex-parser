import { config } from './config/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './core/users/users.module';
import { EncryptionModule } from './shared/modules/encryption/encryption.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UsersModule,
    EncryptionModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
