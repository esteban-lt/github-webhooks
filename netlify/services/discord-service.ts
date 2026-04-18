export class DiscordService {

  private readonly discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL ?? '';

  public async notify(message: string) {
    const response = await fetch(this.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      console.log('Error sending message to discord');
      return false;
    }

    return true;
  }
}
