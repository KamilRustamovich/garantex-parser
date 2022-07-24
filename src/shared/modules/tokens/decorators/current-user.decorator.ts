import {
    createParamDecorator,
    InternalServerErrorException,
    ExecutionContext
} from '@nestjs/common'
import { ExpressRequestInterface } from 'src/shared/interfaces/expressRequest.interface'
import { UserEntity } from '../../../../database/entities/user.entity'

export const CurrentUser = createParamDecorator(
    (data, ctx: ExecutionContext): UserEntity => {
        const req = ctx.switchToHttp().getRequest<ExpressRequestInterface>()

        if (!req.user) {
            throw new InternalServerErrorException(
                `Can not get extract user from request`,
            )
        }

        return req.user as UserEntity
    },
)
