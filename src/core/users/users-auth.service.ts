import { UserRoleEnum } from 'src/shared/enums/user-role.enum';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Logardian } from 'logardian'
import { EntityManager } from 'typeorm'


import {
    SignInDTO,
    SignUpDTO,
    ResendEmailDTO,
    RefreshTokenDTO,
    VerifyEmailDTO,
    ChangePasswordDTO,
} from './dtos'

import { AuthorizedUserResponse } from './interfaces'
import { isEmail } from 'class-validator'
import { RestorePasswordEntity } from '../../database/entities/restore-password.entity'
import { ConfirmRestoredPasswordDTO } from './dtos/restore-password.dto'
import { MILLISECONDS } from 'src/shared/constants/milliseconds.constant'
import { UserStatusEnum } from 'src/shared/enums/user-status.enum'
import { MailsService } from 'src/shared/modules/mails/mails.service'
import { EncryptionService } from 'src/shared/modules/encryption/encryption.service'
import { TokensService } from 'src/shared/modules/tokens/tokens.service'
import { UserEntity } from 'src/database/entities/user.entity'
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity'

@Injectable()
export class UsersAuthService {
    private _logger = new Logardian()

    constructor(
        private readonly _mailsService: MailsService,
        @InjectEntityManager()
        private readonly _entityManager: EntityManager,
        private readonly _encryptionService: EncryptionService,
        private readonly _tokensService: TokensService,
    ) {}

    async signUp(dto: SignUpDTO): Promise<boolean> {
        await this._entityManager.transaction(async (manager) => {
            const { email, password } = dto

            const userRepository = manager.getRepository(UserEntity)

            const userByEmail = await userRepository.findOneBy({
                email,
            })

            if (
                userByEmail &&
                userByEmail.status === UserStatusEnum.EMAIL_VERIFICATION_PENDING
            ) {
                throw new BadRequestException({
                    message: 'USER_EMAIL_NOTIFICATION_WAITING',
                    description: `User need to verify its email address`,
                })
            }

            if (userByEmail) {
                throw new BadRequestException({
                    message: 'USER_ALREADY_REGISTERED',
                    description: `User with email ${email} has already registered`,
                })
            }

            // CREATE USER IN DATABASE
            const verificationCode = this._mailsService.generateCode()

            const newUser = userRepository.create({
                email,
                password: await this._encryptionService.encrypt(password),
                status: UserStatusEnum.EMAIL_VERIFICATION_PENDING,
                verificationCode: await this._encryptionService.encrypt(
                    verificationCode,
                ),
                role: UserRoleEnum.CLIENT
            })

            // // SEND VERIFICATION CODE TO EMAIL
            // await this._mailsService.sendMessage([
            //     {
            //         email,
            //         verificationCode,
            //     },
            // ])

            newUser.sendCodeAt = new Date()

            await userRepository.save(newUser)

            this._logger.log(`New user (${email}), with verification code: (${verificationCode})`, { label: 'auth' })
        })

        return true
    }

    async signIn(dto: SignInDTO): Promise<AuthorizedUserResponse> {
        const { password, email } = dto

        const userRepository = this._entityManager.getRepository(UserEntity)

        const userByEmail = await userRepository.findOneBy({
            email,
        })

        if (!userByEmail) {
            throw new BadRequestException({
                message: 'INVALID_CREDENTIALS',
                description: `User not found with email: ${email}`,
            })
        }

        const decryptedPassword = await this._encryptionService.decrypt(
            userByEmail.password,
        )

        if (decryptedPassword !== password) {
            throw new BadRequestException({
                message: 'INVALID_CREDENTIALS',
                description: `Invalid password: ${password}`,
            })
        }

        const { id: userId } = userByEmail

        if (userByEmail.status !== UserStatusEnum.ACTIVE) {
            throw new ForbiddenException({
                message: 'INVALID_CREDENTIALS',
                description: `User status is not active: ${userByEmail.status}`,
            })
        }

        const accessToken = await this._tokensService.generateAccessToken(
            userId,
        )
        const refreshToken = await this._tokensService.generateRefreshToken(
            userId,
        )

        return {
            userId,
            accessToken,
            refreshToken,
            expiresAt:
                Math.floor(Date.now() / MILLISECONDS) +
                this._tokensService.accessTokenTTL,
        }
    }

    async resendEmail(dto: ResendEmailDTO): Promise<boolean> {
        const { email } = dto

        const userRepository = this._entityManager.getRepository(UserEntity)

        const userByEmail = await userRepository.findOneBy({
            email,
        })

        if (!userByEmail) {
            throw new NotFoundException({
                message: 'USER_NOT_FOUND',
                description: `User not found with email: ${email}`,
            })
        }

        if (userByEmail.status !== UserStatusEnum.EMAIL_VERIFICATION_PENDING) {
            throw new BadRequestException({
                message: 'USER_ALREADY_REGISTERED',
                description: `User with email ${email} has already registered`,
            })
        }

        // If user send email code less than 60 seconds ago
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (Date.now() - userByEmail.sendCodeAt.getTime() < 60000) {
            throw new BadRequestException({
                message: 'USER_CALM_DOWN',
                description: `Wait ${
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    60 -
                    Math.floor(
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        (Date.now() - userByEmail.sendCodeAt.getTime()) / 1000,
                    )
                } seconds before send email code again`,
            })
        }

        const verificationCode = this._mailsService.generateCode()

        userByEmail.verificationCode = await this._encryptionService.encrypt(
            verificationCode,
        )

        // await this._mailsService.sendMessage([
        //     {
        //         email,
        //         verificationCode,
        //     },
        // ])

        userByEmail.sendCodeAt = new Date()

        await userRepository.save(userByEmail)

        this._logger.log(`Send verfication code: (${verificationCode}), to email: (${email})`)

        return true
    }

    async refreshToken(dto: RefreshTokenDTO): Promise<AuthorizedUserResponse> {
        const { refreshToken } = dto

        const refreshTokenPayload =
            await this._tokensService.decodeRefreshToken(refreshToken)

        const tokenRepository =
            this._entityManager.getRepository(RefreshTokenEntity)

        const token = await tokenRepository.findOneBy({
            id: refreshTokenPayload.jti,
        })

        if (!token) {
            throw new UnprocessableEntityException({
                message: 'REFRESH_TOKEN_NOT_FOUND',
                description: 'Refresh token not found in database',
            })
        }

        if (token.isRevoked) {
            throw new UnprocessableEntityException({
                message: 'REFRESH_TOKEN_REVOKED',
                description: 'User has already used this refresh token',
            })
        }

        const user = await this._entityManager
            .getRepository(UserEntity)
            .findOneBy({ id: token.userId })

        if (!user) {
            throw new UnprocessableEntityException(`REFRESH_TOKEN_MALFORMED`)
        }

        const { id } = user

        const accessToken = await this._tokensService.generateAccessToken(id)
        const newRefreshToken = await this._tokensService.generateRefreshToken(
            id,
        )

        token.isRevoked = true

        await tokenRepository.save(token)

        return {
            userId: id,
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt:
                Math.floor(Date.now() / MILLISECONDS) +
                this._tokensService.accessTokenTTL,
        }
    }

    async verifyEmail(dto: VerifyEmailDTO): Promise<AuthorizedUserResponse> {
        const { verificationCode, email } = dto

        const userRepository = this._entityManager.getRepository(UserEntity)

        const userByUserId = await userRepository.findOneBy({ email })

        if (!userByUserId) {
            throw new NotFoundException({
                message: 'USER_NOT_FOUND',
                description: `User not found with email: ${email}`,
            })
        }

        if (userByUserId.status !== UserStatusEnum.EMAIL_VERIFICATION_PENDING) {
            throw new BadRequestException({
                message: 'EMAIL_ALREADY_VERIFIED',
                description: `Email for this user has already verified`,
            })
        }

        const decrpytedVerificationCode = await this._encryptionService.decrypt(
            userByUserId.verificationCode,
        )

        if (verificationCode !== decrpytedVerificationCode) {
            throw new BadRequestException({
                message: `VERIFICATION_CODE_INVALID`,
                description: `Provided verification code: ${verificationCode} invalid`,
            })
        }

        userByUserId.status = UserStatusEnum.ACTIVE

        await userRepository.save(userByUserId)

        this._logger.log(
            `User ${userByUserId.email} verified his email address.`,
            { label: 'auth' },
        )

        const accessToken = await this._tokensService.generateAccessToken(
            userByUserId.id,
        )
        const refreshToken = await this._tokensService.generateRefreshToken(
            userByUserId.id,
        )

        return {
            userId: userByUserId.id,
            accessToken,
            refreshToken,
            expiresAt:
                Math.floor(Date.now() / MILLISECONDS) +
                this._tokensService.accessTokenTTL,
        }
    }

    async restorePassword(dto: ResendEmailDTO): Promise<string> {
        const { email } = dto

        // Validation
        if (!isEmail(email)) {
            throw new BadRequestException({
                message: 'EMAIL_INCORRECT',
                description: `Incorrect email ${email}`,
            })
        }

        const userRepository = this._entityManager.getRepository(UserEntity)
        const restorePasswordRepository = this._entityManager.getRepository(
            RestorePasswordEntity,
        )

        const userByEmail = await userRepository.findOneBy({
            email,
        })

        if (!userByEmail) {
            throw new NotFoundException({
                message: 'USER_NOT_FOUND',
                description: `User not found with email: ${email}`,
            })
        }

        const verificationCode = this._mailsService.generateCode()
        const encyptedCode = await this._encryptionService.encrypt(
            verificationCode,
        )

        const restorePasswordByEmail = await restorePasswordRepository.findOne({
            where: { email },
            order: { sendCodeAt: 'DESC' },
        })

        if (restorePasswordByEmail) {
            const timeDifference =
                Date.now() - restorePasswordByEmail.sendCodeAt.getTime()
            const waitTime = 60 - Math.floor(timeDifference / 1000)

            // If user send email code less than 60 seconds ago
            if (timeDifference < 60000) {
                throw new BadRequestException({
                    message: `USER_CALM_DOWN: ${waitTime}`,
                    description: `Wait ${waitTime} seconds before send email code again`,
                })
            }
        }

        const restorePassword = await restorePasswordRepository.create({
            email,
            verificationCode: encyptedCode,
            confirmed: false,
        })

        // await this._mailsService.sendMessage([
        //     {
        //         email,
        //         verificationCode,
        //     },
        // ])

        restorePassword.sendCodeAt = new Date()

        await restorePasswordRepository.save(restorePassword)

        this._logger.log(`Send verfication code: (${verificationCode}), to email: (${email})`)
        
        return restorePassword.id
    }

    async confirmRestoredPassword(
        dto: ConfirmRestoredPasswordDTO,
    ): Promise<boolean> {
        const restorePasswordRepository = this._entityManager.getRepository(
            RestorePasswordEntity,
        )

        const { id, verificationCode } = dto

        const restorePassword = await restorePasswordRepository.findOneBy({ id })

        if (!restorePassword) {
            throw new NotFoundException({
                message: 'RESTORE_PASSWORD_ENTITY_NOT_FOUND',
                description: `restorePasswordEntity not found with id: ${id}`,
            })
        }

        const decryptedCode = await this._encryptionService.decrypt(
            restorePassword.verificationCode,
        )

        if (decryptedCode !== verificationCode) {
            throw new BadRequestException({
                message: `VERIFICATION_CODE_INVALID`,
                description: `Provided verification code: ${verificationCode} invalid`,
            })
        }

        restorePassword.confirmed = true

        await restorePasswordRepository.save(restorePassword)

        return true
    }

    async changePassword(dto: ChangePasswordDTO): Promise<boolean> {
        const restorePasswordRepository = this._entityManager.getRepository(
            RestorePasswordEntity,
        )
        const userRepository = this._entityManager.getRepository(UserEntity)

        const { id, newPassword } = dto

        const restorePassword = await restorePasswordRepository.findOneBy({ id })

        if (!restorePassword) {
            throw new NotFoundException({
                message: 'RESTORE_PASSWORD_ENTITY_NOT_FOUND',
                description: `resotrePasswordEntity not found with id: ${id}`,
            })
        }

        if (restorePassword.confirmed === false) {
            throw new BadRequestException({
                message: 'VERIFICATION_CODE_NOT_CONFIRMED',
                description: `User need to verify its email address`,
            })
        }

        const { email } = restorePassword

        const userByEmail = await userRepository.findOneBy({
            email,
        })

        if (!userByEmail) {
            throw new NotFoundException({
                message: 'USER_NOT_FOUND',
                description: `User not found with email: ${email}`,
            })
        }

        if (userByEmail.status !== UserStatusEnum.ACTIVE) {
            throw new ForbiddenException({
                message: 'INVALID_CREDENTIALS',
                description: `User status is not active: ${userByEmail.status}`,
            })
        }

        userByEmail.password = await this._encryptionService.encrypt(
            newPassword,
        )

        await userRepository.save(userByEmail)

        await restorePasswordRepository.softRemove(restorePassword)

        return true
    }
}
