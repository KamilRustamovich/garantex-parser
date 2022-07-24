import { IsEmail, Length } from 'class-validator'

export class VerifyEmailDTO {
    @Length(6)
    verificationCode: string

    @IsEmail()
    email: string
}
