import { SnakeNamingStrategy } from '../database/strategies/snake-case.strategy'

const DEFAULT_PSQL_HOST = 'localhost'
const DEFAULT_PSQL_PORT = 5432

const port = parseInt(process.env.PSQL_PORT || `${DEFAULT_PSQL_PORT}`, 10)

const connectionOptions = {
    type: 'postgres',
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    database: process.env.PSQL_DATABASE,
    host: process.env.PSQL_HOST || DEFAULT_PSQL_HOST,
    port,
    namingStrategy: new SnakeNamingStrategy(),
    username: process.env.PSQL_USERNAME,
    password: process.env.PSQL_PASSWORD,
    migrations: [`${__dirname}/../database/migrations/*{.ts,.js}`],
    cli: {
        migrationsDir: `${__dirname}/../database/migrations`,
    },
}

export = connectionOptions