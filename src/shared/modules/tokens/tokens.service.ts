import { UserRoleEnum } from './../../enums/user-role.enum';
import { JwtService } from '@nestjs/jwt'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { SignOptions, TokenExpiredError } from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { RefreshTokenPayload } from '../../interfaces/refresh-token-payload.interface'
import { MILLISECONDS } from 'src/shared/constants/milliseconds.constant'

@Injectable()
export class TokensService {
    private readonly _jwtIssuerUrl: string
    private readonly _jwtAccessTTL: number
    private readonly _jwtRefreshTTL: number

    constructor(
        @InjectEntityManager()
        private readonly _entityManager: EntityManager,
        private readonly _jwtService: JwtService,
        private readonly _configService: ConfigService,
    ) {
        const jwtIssuerUrl = this._configService.get<string>(`JWT_ISSUER_URL`)

        if (!jwtIssuerUrl) {
            throw new Error(`JWT_ISSUER_URL is not provided in .env`)
        }

        this._jwtIssuerUrl = jwtIssuerUrl

        const jwtAccessTTL = this._configService.get<string>(
            `JWT_ACCESS_TTL_SECONDS`,
        )

        if (!jwtAccessTTL) {
            throw new Error(`JWT_ACCESS_TTL_SECONDS is not provided in .env`)
        }

        this._jwtAccessTTL = parseInt(jwtAccessTTL)

        const jwtRefreshTTL = this._configService.get<string>(
            `JWT_REFRESH_TTL_SECONDS`,
        )

        if (!jwtRefreshTTL) {
            throw new Error(`JWT_REFRESH_TTL_SECONDS is not provided in .env`)
        }

        this._jwtRefreshTTL = parseInt(jwtRefreshTTL)
    }

    async generateAccessToken(
        userId: string,
        role = UserRoleEnum.CLIENT,
    ): Promise<string> {
        const signOptions: SignOptions = {
            issuer: this._jwtIssuerUrl,
            audience: this._jwtIssuerUrl,
            expiresIn: this._jwtAccessTTL,
            subject: userId,
        }

        return await this._jwtService.signAsync(
            {
                role,
            },
            signOptions,
        )
    }

    async generateRefreshToken(
        userId: string,
        role = UserRoleEnum.CLIENT,
    ): Promise<string> {
        const refreshTokenRepository =
            this._entityManager.getRepository(RefreshTokenEntity)

        const refreshToken = refreshTokenRepository.create({
            userId,
            expiresAt: new Date(
                Date.now() + this._jwtRefreshTTL * MILLISECONDS,
            ),
        })

        const savedRefreshToken = await refreshTokenRepository.save(
            refreshToken,
        )

        const opts: SignOptions = {
            issuer: this._jwtIssuerUrl,
            audience: this._jwtIssuerUrl,
            expiresIn: this._jwtRefreshTTL,
            subject: userId,
            jwtid: savedRefreshToken.id,
        }

        return await this._jwtService.signAsync(
            {
                role,
            },
            opts,
        )
    }

    async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
        try {
            return await this._jwtService.verifyAsync(token)
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnprocessableEntityException({
                    message: 'REFRESH_TOKEN_EXPIRED',
                })
            }

            throw new UnprocessableEntityException({
                message: 'REFRESH_TOKEN_MALFORMED',
                description: 'Token is not valid configuration',
            })
        }
    }

    get accessTokenTTL(): number {
        return this._jwtAccessTTL
    }

    get refreshTokenTTL(): number {
        return this._jwtRefreshTTL
    }
}
