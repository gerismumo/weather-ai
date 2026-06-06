import * as path from 'path';
import * as dotenv from 'dotenv';
import { EnvConfig, NodeEnv } from './env.types';

function loadEnv() {
  const envFiles = ['.env', `.env.prodution`, `.env.development`, '.env.local'];

  for (const file of envFiles) {
    const fullPath = path.resolve(__dirname, '../../../', file);

    const result = dotenv.config({
      path: fullPath,
      override: false,
    });

    if (result.error) {
      console.warn(`[env] Not loaded: ${fullPath}`);
    } else {
      console.log(`[env] Loaded: ${fullPath}`);
    }
  }
}

loadEnv();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  switch (value) {
    case NodeEnv.DEVELOPMENT:
    case NodeEnv.PRODUCTION:
    case NodeEnv.TEST:
      return value;
    default:
      throw new Error(
        `Invalid NODE_ENV: ${value}. Must be one of: development | production | test`,
      );
  }
}

export const ENV: EnvConfig = {
  HOST_NAME: process.env.HOST_NAME || 'localhost',

  PORT: parseInt(required('PORT'), 10),

  NODE_ENV: parseNodeEnv(required('NODE_ENV')),

  WEATHER_API_KEY: required('WEATHER_API_KEY'),

  CORS_ORIGINS: process.env.CORS_ORIGINS,
  CORS_DEV_ORIGINS: process.env.CORS_DEV_ORIGINS,
  

} as const;
