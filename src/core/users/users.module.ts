import { UserAuthController } from './user-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common'
import { MailsModule } from '../../shared/modules/mails/mails.module'
import { TokensModule } from '../../shared/modules/tokens/tokens.module'
import { UsersAuthService } from './users-auth.service'
import { UserEntity } from 'src/database/entities/user.entity';

@Module({
    imports: [
        MailsModule, 
        TokensModule,
        TypeOrmModule.forFeature([UserEntity])
    ],
    controllers: [UserAuthController],
    providers: [UsersAuthService],
    exports: [UsersAuthService],
})
export class UsersModule {}
