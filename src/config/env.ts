import { get } from 'env-var';

export const env = {
  PORT: get('PORT').required().asPortNumber(),
  DISCORD_WEBHOOK_URL: get('DISCORD_WEBHOOK_URL').required().asString(),
  WEBHOOK_SECRET: get('WEBHOOK_SECRET').required().asString(),
}
