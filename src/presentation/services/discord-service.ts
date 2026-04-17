import { env } from '../../config/env';

export class DiscordService {

  private readonly discordWebhookUrl = env.DISCORD_WEBHOOK_URL;

  public async notify(message: string) {
    const body = {
      content: message,
    };

    const response = await fetch(this.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if(!response.ok) {
      console.log('Error sending message to discord');
      return false;
    }

    return true;
  }
}
