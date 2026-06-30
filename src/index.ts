export type ParseMode = "MarkdownV2" | "Markdown" | "HTML";

export interface NotifierOptions {
  /** Telegram bot token (from @BotFather) */
  token: string;
  /** Target chat id (user, group or channel) */
  chatId: string | number;
  /** Default parse mode for messages */
  parseMode?: ParseMode;
  /** Disable link previews by default */
  disablePreview?: boolean;
  /** Called when a fire-and-forget send fails. Defaults to a noop. */
  onError?: (error: unknown) => void;
}

export interface SendOptions {
  parseMode?: ParseMode;
  disablePreview?: boolean;
  silent?: boolean;
}

const API = "https://api.telegram.org/bot";

/**
 * Tiny fire-and-forget Telegram notifier.
 *
 * ```ts
 * const tg = new Notifier({ token: "123:abc", chatId: 456 });
 * tg.send("Something happened");          // fire and forget
 * await tg.sendAsync("Need the result");  // awaitable
 * ```
 */
export class Notifier {
  constructor(private readonly opts: NotifierOptions) {
    if (!opts?.token) throw new Error("tgfire: `token` is required");
    if (opts.chatId === undefined || opts.chatId === null)
      throw new Error("tgfire: `chatId` is required");
  }

  /** Send a message without awaiting. Errors go to `onError` (or are swallowed). */
  send(text: string, options?: SendOptions): void {
    void this.sendAsync(text, options).catch(
      this.opts.onError ?? (() => {})
    );
  }

  /** Send a message and resolve with Telegram's JSON response. */
  async sendAsync(text: string, options?: SendOptions): Promise<unknown> {
    const parseMode = options?.parseMode ?? this.opts.parseMode;
    const disablePreview = options?.disablePreview ?? this.opts.disablePreview;

    const body: Record<string, unknown> = {
      chat_id: this.opts.chatId,
      text,
    };
    if (parseMode) body.parse_mode = parseMode;
    if (disablePreview) body.link_preview_options = { is_disabled: true };
    if (options?.silent) body.disable_notification = true;

    const res = await fetch(`${API}${this.opts.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`tgfire: Telegram API ${res.status} ${detail}`.trim());
    }
    return res.json();
  }
}

export default Notifier;
