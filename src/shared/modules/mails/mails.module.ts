import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { mailerConfig } from '../../../config/mailer.config'
import { MailsService } from './mails.service'

@Module({
    imports: [MailerModule.forRootAsync(mailerConfig)],
    providers: [MailsService],
    exports: [MailsService],
})
export class MailsModule {}
