import { Router } from 'express';
import { GitHubController } from './github-controller';
import { GitHubService } from '../services/github-service';
import { DiscordService } from '../services/discord-service';

export class GitHubRoutes {

  public static get routes() {
    const router = Router();
    const githubService = new GitHubService();
    const discordService = new DiscordService();
    const githubController = new GitHubController(githubService, discordService);

    router.post('/', githubController.webhookHandler);

    return router;
  }
}
