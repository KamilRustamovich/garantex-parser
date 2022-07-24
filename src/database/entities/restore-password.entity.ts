import { Entity, Column } from 'typeorm'
import { CommonBaseEntity } from './common-base.entity'

@Entity('restore_password')
export class RestorePasswordEntity extends CommonBaseEntity {
    @Column()
    email: string

    @Column({ name: 'verification_code' })
    verificationCode: string

    @Column({ type: 'timestamp with time zone', name: 'send_code_at' })
    sendCodeAt: Date

    @Column({ default: false })
    confirmed: boolean
}