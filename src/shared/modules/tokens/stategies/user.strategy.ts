import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserRoleEnum } from 'src/shared/enums/user-role.enum'
import { UserStatusEnum } from 'src/shared/enums/user-status.enum'
import { getManager } from 'typeorm'
import { UserEntity } from '../../../../database/entities/user.entity'

export interface AccessTokenPayload {
    role: UserRoleEnum
    sub: string
}

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user') {
    constructor(private readonly _configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: _configService.get('JWT_SECRET'),
            signOptions: {
                expiresIn: _configService.get('JWT_EXPIRES_IN') || '10m',
                algorithm: _configService.get('JWT_ALGORITHM'),
            },
        })
    }

    async validate(payload: AccessTokenPayload): Promise<UserEntity> {
        const { sub: id, role } = payload

        if (role !== UserRoleEnum.CLIENT) {
            throw new ForbiddenException({
                message: `FORBIDDEN`,
                description: `Not a client role`,
            })
        }

        const user = await getManager().getRepository(UserEntity).findOne({
            where: {
                id,
            },
        })

        if (!user) {
            throw new ForbiddenException({
                message: `FORBIDDEN`,
                description: `Client not found in JWT stategy. ID: ${id}`,
            })
        }

        if (user.status !== UserStatusEnum.ACTIVE) {
            throw new ForbiddenException({
                message: `USER_STATUS_FORBIDDEN`,
                description: `Client has status: ${user.status}`,
            })
        }

        return user
    }
}
