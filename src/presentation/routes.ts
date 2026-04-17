import { Router } from 'express';
import { GitHubRoutes } from './github/github-routes';

export class Routes {

  public static get routes() {
    const router = Router();

    router.use('/api/github', GitHubRoutes.routes);

    return router;
  }
}