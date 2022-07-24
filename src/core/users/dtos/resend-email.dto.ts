import { IsEmail } from 'class-validator'

export class ResendEmailDTO {
    @IsEmail()
    email: string
}
