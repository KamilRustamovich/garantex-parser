import { Entity, Column } from 'typeorm'
import { CommonBaseEntity } from './common-base.entity'

@Entity('mails')
export class MailEntity extends CommonBaseEntity {
    @Column()
    email: string

    @Column({ default: false })
    isSent: boolean

    @Column({ default: false })
    isSending: boolean

    @Column()
    verificationCode: string
}