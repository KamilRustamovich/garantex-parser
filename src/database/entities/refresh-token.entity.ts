import { Entity, Column } from 'typeorm'
import { CommonBaseEntity } from './common-base.entity'

@Entity('refresh_tokens')
export class RefreshTokenEntity extends CommonBaseEntity {
    @Column({ name: 'user_id' })
    userId: string

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean

    @Column({ type: 'timestamp with time zone', name: 'expires_at' })
    expiresAt: Date
}