import { env } from './config/env';
import { Routes } from './presentation/routes';
import { Server } from './presentation/server';

(() => {
  main();
})();

function main() {
  new Server({
    port: env.PORT,
    routes: Routes.routes,
  }).start();
}
