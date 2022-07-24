import { IsUUID, Length } from 'class-validator'

export class ConfirmRestoredPasswordDTO {
    @IsUUID()
    id: string

    @Length(6)
    verificationCode: string
}
