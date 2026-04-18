import type { Config, Context } from '@netlify/edge-functions';
import { GitHubService } from '../services/github-service.ts';
import { DiscordService } from '../services/discord-service.ts';
import type { GitHubStar } from '../interfaces/github-star.ts';
import type { GitHubIssue } from '../interfaces/github-issue.ts';
import { GitHubSha256 } from '../services/github-sha256.ts';

const githubService = new GitHubService();
const discordService = new DiscordService();

export default async (request: Request, context: Context) => {

  const rawBody = await request.text();

  const isValid = await GitHubSha256.verify(request, rawBody);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const githubEvent = request.headers.get('x-github-event');
  const payload = JSON.parse(rawBody);
  let message: string;

  switch (githubEvent) {
    case 'star':
      message = githubService.onStar(payload as GitHubStar);
      break;
    case 'issues':
      message = githubService.onIssue(payload as GitHubIssue);
      break;
    default:
      message = `Unknown event ${githubEvent}`;
  }

  await discordService.notify(message);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config: Config = {
  path: '/github-to-discord',
};
