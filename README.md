# tgfire

Tiny **fire-and-forget** Telegram notifier for app alerts. Zero dependencies, ~1 KB, works in Node 18+, Bun and Deno (uses native `fetch`).

```bash
bun add tgfire
# or: npm i tgfire
```

## Usage

```ts
import { Notifier } from "tgfire";

const tg = new Notifier({
  token: "123456:ABC-your-bot-token",
  chatId: 987654321, // user, group or channel id
});

// Fire and forget — never throws, never blocks
tg.send("🔥 Something happened in prod");

// Want the result / to handle errors? await it
await tg.sendAsync("Deploy finished ✅");
```

### Per-message options

```ts
tg.send("*bold* alert", { parseMode: "Markdown" });
tg.send("quiet ping", { silent: true });          // no notification sound
tg.send("https://x.com", { disablePreview: true });
```

### Handling errors on fire-and-forget

By default `send()` swallows errors. Pass `onError` to log them:

```ts
const tg = new Notifier({
  token,
  chatId,
  onError: (err) => console.error("telegram failed", err),
});
```

## API

### `new Notifier(options)`

| option           | type                                       | default | description                          |
| ---------------- | ------------------------------------------ | ------- | ------------------------------------ |
| `token`          | `string`                                   | —       | Bot token from [@BotFather]          |
| `chatId`         | `string \| number`                         | —       | Target chat id                       |
| `parseMode`      | `"MarkdownV2" \| "Markdown" \| "HTML"`     | —       | Default parse mode                   |
| `disablePreview` | `boolean`                                  | `false` | Disable link previews                |
| `onError`        | `(error) => void`                          | noop    | Called when a `send()` fails         |

### `tg.send(text, options?) => void`

Fire-and-forget. Returns immediately, never throws.

### `tg.sendAsync(text, options?) => Promise<unknown>`

Awaitable. Resolves with Telegram's JSON response, rejects on API error.

`options`: `{ parseMode?, disablePreview?, silent? }`

## Getting a bot token & chat id

1. Talk to [@BotFather], create a bot, copy the token.
2. Send a message to your bot, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat.id`.

[@BotFather]: https://t.me/BotFather

## License

MIT
