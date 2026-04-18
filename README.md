# GitHub Webhooks → Discord Notifications

A project demonstrating **two distinct approaches** to handling GitHub Webhooks and forwarding notifications to Discord — a traditional Express server and a modern serverless edge function deployment.

## Overview

This project receives GitHub webhook events (stars and issues), validates the request's HMAC-SHA256 signature for security, and sends a formatted notification to a Discord channel via webhook.

The same functionality is implemented twice, intentionally, to compare the architectural trade-offs between the two approaches:

| | Express Server | Netlify Edge Functions |
|---|---|---|
| **Runtime** | Bun | Deno (via Netlify) |
| **Execution model** | Long-lived process | Serverless, on-demand |
| **Architecture** | Classes, services, controllers, middleware | Lightweight handler functions |
| **Entry point** | `src/main.ts` | `netlify/edge-functions/github-to-discord.ts` |
| **Runs at** | Your server / any host | The network edge, close to users |

---

## Project Structure

```
github-webhooks/
├── src/                                     # Express server implementation (Bun)
│   ├── main.ts                              # Entry point
│   ├── config/
│   │   └── env.ts                           # Validated environment variables
│   ├── interfaces/
│   │   ├── github-star.ts                   # GitHub star event payload type
│   │   └── github-issue.ts                  # GitHub issue event payload type
│   └── presentation/
│       ├── server.ts                        # Express server setup
│       ├── routes.ts                        # Root router
│       ├── github/
│       │   ├── github-routes.ts             # /api/github route definition
│       │   └── github-controller.ts         # Request handler
│       ├── services/
│       │   ├── github-service.ts            # Formats event messages
│       │   └── discord-service.ts           # Sends messages to Discord
│       └── middlewares/
│           └── github-sha256-middleware.ts  # HMAC-SHA256 signature validation
│
└── netlify/                                 # Netlify Edge Functions implementation (Deno)
    ├── edge-functions/
    │   ├── github-to-discord.ts             # Main edge function handler
    │   └── hello.ts                         # Health check endpoint
    ├── interfaces/
    │   ├── github-star.ts
    │   └── github-issue.ts
    └── services/
        ├── github-service.ts                # Formats event messages
        ├── discord-service.ts               # Sends messages to Discord
        └── github-sha256.ts                 # HMAC-SHA256 signature validation
```

---

## Architecture

### Approach 1 — Express Server (`src/`)

A traditional layered architecture running on **Bun**:

```
GitHub → POST /api/github
           │
           ▼
  GitHubSha256Middleware     ← validates HMAC-SHA256 signature globally
           │
           ▼
  GitHubController           ← reads x-github-event header, routes by event type
           │
           ▼
  GitHubService              ← formats the event into a human-readable message
           │
           ▼
  DiscordService             ← POSTs the message to the Discord webhook URL
```

The signature validation is applied as an Express middleware at the server level, protecting all routes automatically.

### Approach 2 — Netlify Edge Functions (`netlify/`)

A serverless implementation running on **Deno** at the network edge:

```
GitHub → POST /github-to-discord
           │
           ▼
  GitHubSha256.verify()      ← validates HMAC-SHA256 signature inline
           │
           ▼
  switch(x-github-event)     ← routes by event type within the same function
           │
           ▼
  GitHubService              ← formats the event into a human-readable message
           │
           ▼
  DiscordService             ← POSTs the message to the Discord webhook URL
```

No persistent process — the function spins up per request, runs to completion, and shuts down. Configuration is handled via `netlify.toml`.

### Security: HMAC-SHA256 Signature Validation

Both implementations verify that incoming requests are genuinely from GitHub using the `x-hub-signature-256` header. The raw request body is hashed with HMAC-SHA256 using the shared `WEBHOOK_SECRET`, and the result is compared against the header value via the Web Crypto API (`crypto.subtle`). Requests with an invalid or missing signature are rejected with `401 Unauthorized`.

Reference: [GitHub Docs — Validating webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) — for the Express server
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) — for the edge functions (`npm i -g netlify-cli`)
- A Discord webhook URL
- A GitHub repository with webhooks configured

### Environment Variables

Copy `.env.template` to `.env` and fill in your values:

```bash
cp .env.template .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | Express only | Port for the Express server (default: `3000`) |
| `DISCORD_WEBHOOK_URL` | Both | Your Discord webhook URL |
| `WEBHOOK_SECRET` | Both | Secret used to validate GitHub webhook signatures |

**Generate a webhook secret:**
```bash
openssl rand -hex 32
```

**Get a Discord webhook URL:**  
Go to your Discord server → *Server Settings* → *Integrations* → *Webhooks* → *New Webhook*, then copy the URL.

### Install Dependencies

```bash
bun install
```

---

## Running Locally

### Express Server (Bun)

```bash
bun run dev
```

The server starts on `http://localhost:3000`. The webhook endpoint is:

```
POST http://localhost:3000/api/github
```

To expose it to GitHub during local development, use a tunneling tool such as [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Use the generated public URL as your GitHub webhook payload URL (append `/api/github`).

### Netlify Edge Functions (Deno)

```bash
bun run netlify:dev
```

This starts the Netlify Dev server locally (defaults to `http://localhost:8888`). The edge function endpoint is:

```
POST http://localhost:8888/github-to-discord
```

Use the same tunneling approach to expose it to GitHub, or deploy to Netlify and use the live URL.

---

## Configuring the GitHub Webhook

1. Go to your GitHub repository → *Settings* → *Webhooks* → *Add webhook*
2. Set the **Payload URL** to your public endpoint
3. Set the **Content type** to `application/json`
4. Set the **Secret** to the same value as your `WEBHOOK_SECRET`
5. Under *Which events...*, select **Stars** and **Issues**
6. Make sure **Active** is checked, then save

---

## Tech Stack

| | |
|---|---|
| **Language** | TypeScript |
| **Runtime (server)** | [Bun](https://bun.sh) |
| **Runtime (edge)** | Deno (via Netlify) |
| **Framework** | [Express](https://expressjs.com) v5 |
| **Deploy target** | [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/) |
| **Env validation** | [env-var](https://github.com/evanshortiss/env-var) |
| **APIs** | GitHub Webhooks, Discord Webhooks |
| **Security** | HMAC-SHA256 via Web Crypto API |
