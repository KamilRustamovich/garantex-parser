import { ConfigModule, ConfigService } from '@nestjs/config'
import {
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from '@nestjs/typeorm'
import { SnakeNamingStrategy } from '../database/strategies/snake-case.strategy'

const DEFAULT_PSQL_HOST = 'localhost'
const DEFAULT_PSQL_PORT = 5432

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const database = configService.get<string>('PSQL_DATABASE')

        if (database === undefined) {
            throw new Error(
                "Environment variable 'PSQL_DATABASE' cannot be undefined",
            )
        }

        return {
            type: 'postgres',
            entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
            database,
            host: configService.get('PSQL_HOST') || DEFAULT_PSQL_HOST,
            port: configService.get('PSQL_PORT') || DEFAULT_PSQL_PORT,
            namingStrategy: new SnakeNamingStrategy(),
            username: configService.get('PSQL_USERNAME'),
            password: configService.get('PSQL_PASSWORD'),
            synchronize:
                configService.get('NODE_ENV') === 'development-no-migration',
        }
    },
    inject: [ConfigService],
}