 
/* global process, fetch */
const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

/**
 * Send a text message via WhatsApp Cloud API
 */
async function sendTextMessage(to, text) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  // WhatsApp has a 4096 char limit per message — split if needed
  const chunks = splitMessage(text, 4000);

  for (const chunk of chunks) {
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: chunk },
      }),
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
async function sendButtonMessage(to, text, buttons) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  // WhatsApp allows max 3 buttons, each max 20 chars
  const waButtons = buttons.slice(0, 3).map((label, i) => ({
    type: 'reply',
    reply: {
      id: `btn_${i}_${Date.now()}`,
      title: label.length > 20 ? label.substring(0, 17) + '...' : label,
    },
  }));

  // Button body max 1024 chars
  const body = text.length > 1024 ? text.substring(0, 1021) + '...' : text;

  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: { buttons: waButtons },
      },
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown error');
    throw new Error(`WhatsApp API sendButton error ${res.status}: ${errBody}`);
  }
}

/**
 * Send a list message for many suggestions (max 10 items)
 */
async function sendListMessage(to, text, items) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  const rows = items.slice(0, 10).map((label, i) => ({
    id: `list_${i}_${Date.now()}`,
    title: label.length > 24 ? label.substring(0, 21) + '...' : label,
    description: label.length > 24 ? label : '',
  }));

  const body = text.length > 1024 ? text.substring(0, 1021) + '...' : text;

  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
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
async function sendResponseWithSuggestions(to, text, suggestions = []) {
  // Convert markdown bold **text** to WhatsApp bold *text*
  const formattedText = formatForWhatsApp(text);

  if (suggestions.length === 0) {
    return sendTextMessage(to, formattedText);
  }

  if (suggestions.length <= 3) {
    // Check if all suggestions fit in button titles (20 chars)
    const allFit = suggestions.every(s => s.length <= 20);
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
async function markAsRead(messageId) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
  // Non-critical: log warning but don't throw — failing to mark read shouldn't block the reply
  if (!res.ok) {
    console.warn(`[whatsapp] markAsRead failed for ${messageId}: ${res.status}`);
  }
}

/**
 * Convert markdown formatting to WhatsApp formatting
 * **bold** -> *bold*
 * Remove markdown table pipes for cleaner display
 */
function formatForWhatsApp(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')  // **bold** -> *bold*
    .replace(/━+/g, '─────────────')     // shorter separator
    .replace(/══+/g, '═══════════');
}

/**
 * Split long messages into chunks
 */
function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find a good split point (newline)
    let splitAt = remaining.lastIndexOf('\n', maxLen);
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
  markAsRead,
  formatForWhatsApp,
};
