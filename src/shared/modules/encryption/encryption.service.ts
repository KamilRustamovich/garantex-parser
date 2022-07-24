import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import createHash from 'create-hash'
import { SodiumPlus, CryptographyKey } from 'sodium-plus'

@Injectable()
export class EncryptionService {
    private readonly _password: string

    constructor(private readonly _configService: ConfigService) {
        const password = this._configService.get<string>(`SECRET_ENCRYPT_KEY`)

        if (!password) {
            throw new Error(`SECRET_ENCRYPT_KEY is not provided in .env`)
        }

        this._password = password
    }

    async decrypt(encryptedData: string): Promise<string> {
        // Select a backend automatically
        const sodium = await SodiumPlus.auto()

        const hashedPassword = createHash('sha256')
            .update(this._password)
            .digest('hex')

        const key = CryptographyKey.from(hashedPassword, 'hex')

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const nonce = Buffer.from(encryptedData.substring(0, 48), 'hex')
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const ciphertext = Buffer.from(encryptedData.substring(48), 'hex')

        const decrypted = await sodium.crypto_secretbox_open(
            ciphertext,
            nonce,
            key,
        )

        return decrypted.toString('utf-8')
    }

    async encrypt(data: string): Promise<string> {
        const sodium = await SodiumPlus.auto()

        const hashedPassword = createHash('sha256')
            .update(this._password)
            .digest('hex')

        const key = CryptographyKey.from(hashedPassword, 'hex')

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const nonce = await sodium.randombytes_buf(24)

        const ciphertext = await sodium.crypto_secretbox(data, nonce, key)
        const encryptedData = nonce.toString('hex') + ciphertext.toString('hex')

        return encryptedData
    }
}
