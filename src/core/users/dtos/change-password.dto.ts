import { IsUUID, Matches } from 'class-validator'
import { PASSWORD_MESSAGE } from 'src/shared/constants/password-message.constant'
import { PASSWORD_PATTERN } from 'src/shared/constants/password-pattern.constant'

export class ChangePasswordDTO {
    @IsUUID()
    id: string

    @Matches(PASSWORD_PATTERN, {
        message: PASSWORD_MESSAGE,
    })
    newPassword: string
}
