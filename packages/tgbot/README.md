# TG Bot

## Development

### 1. Create a Telegram bot for development

Add [@BotFather](https://t.me/BotFather) and enter the command `/start`. Follow the instructions to create a new bot. You will receive an API token at the end.

### 2. Add the bot API token to .env

```
BOT_TOKEN=<your bot token>
```

### 3. Start the bot

```
pnpm dev
```

Make sure the database is running. If not, run `pnpm db:start` first.
