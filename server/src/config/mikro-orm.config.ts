import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: Options = {
    driver: PostgreSqlDriver,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dbName: process.env.DB_NAME || 'be_main_module',
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    debug: process.env.NODE_ENV !== 'production',
    allowGlobalContext: true,
};

export default config;
