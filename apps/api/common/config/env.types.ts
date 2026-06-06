export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export type EnvConfig = {
  HOST_NAME: string;
  PORT: number;
  NODE_ENV: NodeEnv;
  WEATHER_API_KEY:string;
  CORS_ORIGINS?: string;
  CORS_DEV_ORIGINS?: string;
};
