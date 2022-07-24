import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface'
import { ConfigModule, ConfigService } from '@nestjs/config'

export const mailerConfig: MailerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('SMTP_HOST')

        if (!host) {
            throw new Error(`SMTP_HOST is not provided in .env`)
        }

        const port = configService.get<string>('SMTP_PORT')

        if (!port) {
            throw new Error(`SMTP_PORT is not provided in .env`)
        }

        const ignoreTLS =
            configService.get<string>('SMTP_IGNORE_TLS') === 'true'

        const secure = configService.get<string>('SMTP_SECURE') === 'true'

        const pool = configService.get<string>('SMTP_POOL') === 'true'

        const user = configService.get<string>('SMTP_USER')

        if (!user) {
            throw new Error(`SMTP_USER is not provided in .env`)
        }

        const password = configService.get<string>('SMTP_PASSWORD')

        if (!password) {
            throw new Error(`SMTP_PASSWORD is not provided in .env`)
        }

        return {
            transport: {
                host,
                port: +port,
                ignoreTLS,
                secure,
                auth: {
                    user,
                    pass: password,
                },
                pool,
            },
        }
    },
    inject: [ConfigService],
}
