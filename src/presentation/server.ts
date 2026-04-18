import express, { Router } from 'express';
import { GitHubSha256Middleware } from './middlewares/github-sha256-middleware';

interface Options {
  port: number;
  routes: Router;
}

export class Server {

  private readonly app = express();
  private readonly port: number;
  private readonly routes: Router;
  
  constructor(options: Options) {
    this.port = options.port;
    this.routes = options.routes;
  }

  public start() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(GitHubSha256Middleware.verifyGithubSignature);
    this.app.use(this.routes);

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
