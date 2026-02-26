import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '8787', 10),
  apiKey: process.env.API_KEY ?? 'ACFH4RFOTME4RU50R4FKGNW34LDFG8DSQ',
  authFolder: process.env.AUTH_FOLDER ?? 'auth',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'postgres',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'CHANGE_THIS_SECRET_IN_PRODUCTION',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'CHANGE_THIS_REFRESH_SECRET',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },
  limits: {
    maxButtons: 3,
    maxCarouselCards: 10,
    maxListSections: 10,
    maxListRowsPerSection: 10,
    maxPollOptions: 12,
  },
} as const;

export type Config = typeof config;
