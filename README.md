# Credmapper

_todo: rename this repo to `creddd` after migrating the current `creddd` repo into this monorepo._

## Indexer

### 1. Set environment variables

Create `packages/indexer/.env`

```
DATABASE_URL=postgres://dev:password@localhost:5432/traitmapper
ALCHEMY_API_KEY=<your eth mainnet alchemy api key>
GOOGLE_APPLICATION_CREDENTIALS=<path to your google service account key>
FARCASTER_REPLICA_DB_URL=<farcaster replica db url>
```

### 2. Run the indexer

```
pnpm indexer:sync
```

## Telegram Bot

The bot relies on indexed data. Run `pnpm indexer:sync` before running the bot.

### 1. Create a Telegram bot for development

Add [@BotFather](https://t.me/BotFather) and enter the command `/start`. Follow the instructions to create a new bot. You will receive an API token at the end.

### 2. Set environment variables

Create `packages/tgbot/.env`

```
DATABASE_URL=postgres://dev:password@localhost:5432/traitmapper
BOT_TOKEN=<your bot token>
```

### 3. Start the bot

```
pnpm bot:dev
```

Make sure the database is running. If not, run `pnpm db:start`.
