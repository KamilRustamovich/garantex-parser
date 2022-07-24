import { IsEmail, Matches } from 'class-validator'
import { PASSWORD_MESSAGE } from 'src/shared/constants/password-message.constant'
import { PASSWORD_PATTERN } from 'src/shared/constants/password-pattern.constant'

export class SignInDTO {
    @IsEmail()
    email: string

    @Matches(PASSWORD_PATTERN, {
        message: PASSWORD_MESSAGE,
    })
    password: string
}
