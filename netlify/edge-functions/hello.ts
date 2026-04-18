import type { Config, Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
  return new Response(JSON.stringify({ message: 'Hello' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const config: Config = {
  path: '/hello',
};
