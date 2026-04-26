/**
 * WhatsApp Cloud API Client (TypeScript)
 * Qatar University Advisor
 */

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface WhatsAppButtonReply {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

interface WhatsAppListRow {
  id: string;
  title: string;
  description: string;
}

interface WhatsAppTextPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: { body: string };
}

interface WhatsAppButtonPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    body: { text: string };
    action: { buttons: WhatsAppButtonReply[] };
  };
}

interface WhatsAppListPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'list';
    body: { text: string };
    action: {
      button: string;
      sections: Array<{ title: string; rows: WhatsAppListRow[] }>;
    };
  };
}

interface WhatsAppMarkReadPayload {
  messaging_product: 'whatsapp';
  status: 'read';
  message_id: string;
}

// Sender action API: "read + show typing indicator until next message".
// https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators
interface WhatsAppTypingPayload {
  messaging_product: 'whatsapp';
  status: 'read';
  message_id: string;
  typing_indicator: { type: 'text' };
}

interface WhatsAppImagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'image';
  image: { link: string; caption?: string };
}

interface WhatsAppDocumentPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'document';
  document: { link: string; filename: string; caption?: string };
}

type WhatsAppPayload =
  | WhatsAppTextPayload
  | WhatsAppButtonPayload
  | WhatsAppListPayload
  | WhatsAppMarkReadPayload
  | WhatsAppTypingPayload
  | WhatsAppImagePayload
  | WhatsAppDocumentPayload;

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

// ──────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────

function getCredentials(): { phoneId: string; token: string } {
  const phoneId = process.env.WHATSAPP_PHONE_ID || '';
  const token = process.env.WHATSAPP_TOKEN || '';
  return { phoneId, token };
}

// Retry policy for transient failures from Meta Cloud API.
// Don't retry 4xx (token expired, malformed payload, etc.) — only transient.
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function isRetryable(status: number): boolean {
  return status >= 500 || status === 408 || status === 429;
}

function backoffDelay(attempt: number): number {
  const exp = BASE_DELAY_MS * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 250;
  return exp + jitter;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendPayload(phoneId: string, token: string, payload: WhatsAppPayload): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || !isRetryable(res.status) || attempt === MAX_ATTEMPTS) {
        return res;
      }

      console.warn(`[whatsapp] attempt ${attempt}/${MAX_ATTEMPTS} got ${res.status} — retrying`);
      await sleep(backoffDelay(attempt));
    } catch (err) {
      lastError = err;
      if (attempt === MAX_ATTEMPTS) throw err;
      console.warn(`[whatsapp] attempt ${attempt}/${MAX_ATTEMPTS} threw — retrying`);
      await sleep(backoffDelay(attempt));
    }
  }

  throw lastError ?? new Error('whatsapp: exhausted retries');
}

// ──────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────

/**
 * Send a text message via WhatsApp Cloud API
 */
async function sendTextMessage(to: string, text: string): Promise<void> {
  const { phoneId, token } = getCredentials();

  // WhatsApp has a 4096 char limit per message — split if needed
  const chunks: string[] = splitMessage(text, 4000);

  for (const chunk of chunks) {
    const res = await sendPayload(phoneId, token, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: chunk },
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unknown error');
      throw new Error(`WhatsApp API sendText error ${res.status}: ${errBody}`);
    }
  }
}

/**
 * Send an interactive button message (max 3 buttons)
 */
async function sendButtonMessage(to: string, text: string, buttons: string[]): Promise<void> {
  const { phoneId, token } = getCredentials();

  // WhatsApp allows max 3 buttons, each max 20 chars
  const waButtons: WhatsAppButtonReply[] = buttons.slice(0, 3).map((label, i) => ({
    type: 'reply' as const,
    reply: {
      id: `btn_${i}_${Date.now()}`,
      title: label.length > 20 ? label.substring(0, 17) + '...' : label,
    },
  }));

  // Button body max 1024 chars
  const body: string = text.length > 1024 ? text.substring(0, 1021) + '...' : text;

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: { buttons: waButtons },
    },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown error');
    throw new Error(`WhatsApp API sendButton error ${res.status}: ${errBody}`);
  }
}

/**
 * Send a list message for many suggestions (max 10 items)
 */
async function sendListMessage(to: string, text: string, items: string[]): Promise<void> {
  const { phoneId, token } = getCredentials();

  const rows: WhatsAppListRow[] = items.slice(0, 10).map((label, i) => ({
    id: `list_${i}_${Date.now()}`,
    title: label.length > 24 ? label.substring(0, 21) + '...' : label,
    description: label.length > 24 ? label : '',
  }));

  const body: string = text.length > 1024 ? text.substring(0, 1021) + '...' : text;

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body },
      action: {
        button: 'اختر سؤالاً',
        sections: [{ title: 'اقتراحات', rows }],
      },
    },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown error');
    throw new Error(`WhatsApp API sendList error ${res.status}: ${errBody}`);
  }
}

/**
 * Send response with suggestions
 * Uses buttons for <= 3 suggestions, list for more
 */
async function sendResponseWithSuggestions(
  to: string,
  text: string,
  suggestions: string[] = [],
): Promise<void> {
  // Convert markdown bold **text** to WhatsApp bold *text*
  const formattedText: string = formatForWhatsApp(text);

  if (suggestions.length === 0) {
    return sendTextMessage(to, formattedText);
  }

  if (suggestions.length <= 3) {
    // Check if all suggestions fit in button titles (20 chars)
    const allFit: boolean = suggestions.every((s) => s.length <= 20);
    if (allFit) {
      return sendButtonMessage(to, formattedText, suggestions);
    }
  }

  // For longer suggestions or more than 3, send text first then list
  await sendTextMessage(to, formattedText);
  if (suggestions.length > 0) {
    await sendListMessage(to, 'اختر من الأسئلة التالية:', suggestions);
  }
}

/**
 * Mark message as read
 */
async function markAsRead(messageId: string): Promise<void> {
  const { phoneId, token } = getCredentials();

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
  // Non-critical: log warning but don't throw
  if (!res.ok) {
    console.warn(`[whatsapp] markAsRead failed for ${messageId}: ${res.status}`);
  }
}

/**
 * Show "typing..." indicator. Marks the user's message as read and tells
 * WhatsApp to keep a typing dot visible to the user until the next outbound
 * message arrives (auto-cleared by Meta after ~25s if nothing follows).
 *
 * Use this immediately after receiving a webhook event, before doing any
 * AI/DB work, so the user gets instant feedback that the bot is working.
 */
async function sendTypingIndicator(messageId: string): Promise<void> {
  const { phoneId, token } = getCredentials();

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
    typing_indicator: { type: 'text' },
  });
  if (!res.ok) {
    // Non-critical: typing dots are nice-to-have. Older API versions reject
    // the typing_indicator field — silently degrade to plain markAsRead.
    console.warn(`[whatsapp] sendTypingIndicator failed for ${messageId}: ${res.status}`);
  }
}

/**
 * Send an image by public URL (e.g. university logo from CDN).
 * Note: Meta downloads the URL synchronously — the host must respond < 5s.
 */
async function sendImageMessage(to: string, link: string, caption?: string): Promise<void> {
  const { phoneId, token } = getCredentials();

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: { link, ...(caption ? { caption } : {}) },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown error');
    throw new Error(`WhatsApp API sendImage error ${res.status}: ${errBody}`);
  }
}

/**
 * Send a PDF/document by public URL (e.g. university catalogue).
 */
async function sendDocumentMessage(
  to: string,
  link: string,
  filename: string,
  caption?: string,
): Promise<void> {
  const { phoneId, token } = getCredentials();

  const res = await sendPayload(phoneId, token, {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: { link, filename, ...(caption ? { caption } : {}) },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown error');
    throw new Error(`WhatsApp API sendDocument error ${res.status}: ${errBody}`);
  }
}

/**
 * Convert markdown formatting to WhatsApp formatting
 * **bold** -> *bold*
 * Remove markdown table pipes for cleaner display
 */
function formatForWhatsApp(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')  // **bold** -> *bold*
    .replace(/━+/g, '─────────────')     // shorter separator
    .replace(/══+/g, '═══════════');
}

/**
 * Split long messages into chunks
 */
function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining: string = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find a good split point (newline)
    let splitAt: number = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen * 0.5) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trimStart();
  }

  return chunks;
}

export {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  sendResponseWithSuggestions,
  sendImageMessage,
  sendDocumentMessage,
  sendTypingIndicator,
  markAsRead,
  formatForWhatsApp,
};
