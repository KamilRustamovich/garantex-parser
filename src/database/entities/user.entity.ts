import { UserRoleEnum } from 'src/shared/enums/user-role.enum'
import { UserStatusEnum } from 'src/shared/enums/user-status.enum'
import { Entity, Column, Unique } from 'typeorm'
import { CommonBaseEntity } from './common-base.entity'


@Entity('users')
@Unique(`index_email`, ['email'])
export class UserEntity extends CommonBaseEntity {
    @Column()
    email: string

    @Column()
    password: string

    @Column({
        type: 'enum',
        enum: UserRoleEnum
    })
    role: string

    @Column({
        type: 'enum',
        enum: UserStatusEnum,
        default: UserStatusEnum.EMAIL_VERIFICATION_PENDING,
    })
    status: UserStatusEnum

    @Column({ name: 'verification_code' })
    verificationCode: string

    @Column({ type: 'timestamp with time zone', name: 'send_code_at' })
    sendCodeAt: Date
}
