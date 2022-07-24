import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const jwtConfig: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '10m',
            algorithm: configService.get('JWT_ALGORITHM'),
        },
    }),
    inject: [ConfigService],
}
