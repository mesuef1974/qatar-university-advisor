/**
 * webhook-extended.test.js
 * Extended tests for api/webhook.js handler — covers the full handler flow
 * by mocking all external dependencies
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';

// ── Mocks ────────────────────────────────────────────────────────────
vi.mock('../lib/validateEnv.js', () => ({
  requireEnv: vi.fn().mockReturnValue(true),
}));

vi.mock('../lib/findResponse.js', () => ({
  processMessage: vi.fn().mockResolvedValue({ text: 'response text', suggestions: ['s1'] }),
}));

vi.mock('../lib/whatsapp.js', () => ({
  sendResponseWithSuggestions: vi.fn().mockResolvedValue(undefined),
  markAsRead: vi.fn().mockResolvedValue(undefined),
}));

// ── Helpers ──────────────────────────────────────────────────────────
function createMockRes() {
  return {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
}

function createMockReq(method, options = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.headers = options.headers || {};
  req.query = options.query || {};
  req.socket = { remoteAddress: '127.0.0.1' };
  return req;
}

function makeWebhookBody(messageId, text, type = 'text') {
  const message = { id: messageId, from: '97412345678', type };
  if (type === 'text') {
    message.text = { body: text };
  } else if (type === 'interactive') {
    message.interactive = {
      type: 'button_reply',
      button_reply: { title: text },
    };
  } else if (type === 'image') {
    message.image = { id: 'img123' };
  }
  return {
    entry: [{
      changes: [{
        value: {
          messages: [message],
        },
      }],
    }],
  };
}

function emitBody(req, body) {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  process.nextTick(() => {
    req.emit('data', Buffer.from(str));
    req.emit('end');
  });
}

describe('api/webhook handler', () => {
  let handler, requireEnv, processMessage, sendResponseWithSuggestions, markAsRead;
  const origEnv = { ...process.env };

  beforeEach(async () => {
    vi.resetModules();

    process.env.WEBHOOK_VERIFY_TOKEN = 'my-verify-token';
    process.env.WEBHOOK_APP_SECRET = '';
    process.env.NODE_ENV = 'development';

    const mod = await import('../api-legacy/webhook.js');
    handler = mod.default;

    const valMod = await import('../lib/validateEnv.js');
    requireEnv = valMod.requireEnv;
    requireEnv.mockReturnValue(true);

    const findMod = await import('../lib/findResponse.js');
    processMessage = findMod.processMessage;
    processMessage.mockResolvedValue({ text: 'response text', suggestions: ['s1'] });

    const waMod = await import('../lib/whatsapp.js');
    sendResponseWithSuggestions = waMod.sendResponseWithSuggestions;
    markAsRead = waMod.markAsRead;
    sendResponseWithSuggestions.mockResolvedValue(undefined);
    markAsRead.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  // ── requireEnv failure ────────────────────────────────────────────
  it('returns early when requireEnv fails', async () => {
    requireEnv.mockReturnValue(false);
    const req = createMockReq('GET');
    const res = createMockRes();
    await handler(req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  // ── GET: Webhook verification ─────────────────────────────────────
  describe('GET — webhook verification', () => {
    it('returns challenge on valid verify token', async () => {
      const req = createMockReq('GET', {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'my-verify-token',
          'hub.challenge': 'challenge-123',
        },
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('challenge-123');
    });

    it('returns 403 on invalid verify token', async () => {
      const req = createMockReq('GET', {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'challenge-123',
        },
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 403 when mode is not subscribe', async () => {
      const req = createMockReq('GET', {
        query: {
          'hub.mode': 'unsubscribe',
          'hub.verify_token': 'my-verify-token',
        },
      });
      const res = createMockRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── POST: Content-Type validation ─────────────────────────────────
  it('rejects POST without application/json content-type', async () => {
    const req = createMockReq('POST', {
      headers: { 'content-type': 'text/plain', 'x-forwarded-for': '1.2.3.4' },
    });
    const res = createMockRes();
    emitBody(req, '{}');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(415);
  });

  // ── POST: Invalid JSON ────────────────────────────────────────────
  it('rejects POST with invalid JSON', async () => {
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.5' },
    });
    const res = createMockRes();
    emitBody(req, 'not-json{{{');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── POST: No messages (ping) ──────────────────────────────────────
  it('returns 200 OK for body without messages', async () => {
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.6' },
    });
    const res = createMockRes();
    emitBody(req, { entry: [{ changes: [{ value: {} }] }] });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('OK');
  });

  // ── POST: Text message processing ─────────────────────────────────
  it('processes a text message and sends response', async () => {
    const msgId = `msg-text-${Date.now()}-${Math.random()}`;
    const body = makeWebhookBody(msgId, 'test message');
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.7' },
    });
    const res = createMockRes();
    emitBody(req, body);
    await handler(req, res);
    expect(processMessage).toHaveBeenCalledWith('test message', '97412345678');
    expect(sendResponseWithSuggestions).toHaveBeenCalled();
    expect(markAsRead).toHaveBeenCalledWith(msgId);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ── POST: Interactive button reply ────────────────────────────────
  it('processes interactive button_reply', async () => {
    const msgId = `msg-btn-${Date.now()}-${Math.random()}`;
    const body = makeWebhookBody(msgId, 'button text', 'interactive');
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.8' },
    });
    const res = createMockRes();
    emitBody(req, body);
    await handler(req, res);
    expect(processMessage).toHaveBeenCalledWith('button text', '97412345678');
  });

  // ── POST: Interactive list reply ──────────────────────────────────
  it('processes interactive list_reply', async () => {
    const msgId = `msg-list-${Date.now()}-${Math.random()}`;
    const message = {
      id: msgId, from: '97412345678', type: 'interactive',
      interactive: { type: 'list_reply', list_reply: { title: 'list item' } },
    };
    const body = { entry: [{ changes: [{ value: { messages: [message] } }] }] };
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.9' },
    });
    const res = createMockRes();
    emitBody(req, body);
    await handler(req, res);
    expect(processMessage).toHaveBeenCalledWith('list item', '97412345678');
  });

  // ── POST: Unsupported message type (image) ────────────────────────
  it('replies with help text for unsupported message type', async () => {
    const msgId = `msg-img-${Date.now()}-${Math.random()}`;
    const body = makeWebhookBody(msgId, '', 'image');
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.10' },
    });
    const res = createMockRes();
    processMessage.mockClear();
    sendResponseWithSuggestions.mockClear();
    markAsRead.mockClear();
    emitBody(req, body);
    await handler(req, res);
    expect(sendResponseWithSuggestions).toHaveBeenCalled();
    expect(markAsRead).toHaveBeenCalledWith(msgId);
    // processMessage should NOT be called for unsupported types
    expect(processMessage).not.toHaveBeenCalled();
  });

  // ── POST: Empty text ──────────────────────────────────────────────
  it('returns 200 OK for empty text message', async () => {
    const msgId = `msg-empty-${Date.now()}-${Math.random()}`;
    const body = makeWebhookBody(msgId, '   ');
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.11' },
    });
    const res = createMockRes();
    processMessage.mockClear();
    emitBody(req, body);
    await handler(req, res);
    expect(processMessage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ── POST: Long text truncation ────────────────────────────────────
  it('truncates messages longer than 4000 chars', async () => {
    const msgId = `msg-long-${Date.now()}-${Math.random()}`;
    const longText = 'a'.repeat(5000);
    const body = makeWebhookBody(msgId, longText);
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.12' },
    });
    const res = createMockRes();
    processMessage.mockClear();
    emitBody(req, body);
    await handler(req, res);
    const calledText = processMessage.mock.calls[0][0];
    expect(calledText.length).toBe(4000);
  });

  // ── 405 Method Not Allowed ────────────────────────────────────────
  it('returns 405 for PUT method', async () => {
    const req = createMockReq('PUT', {
      headers: { 'x-forwarded-for': '1.2.3.13' },
    });
    const res = createMockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  // ── POST: processMessage error — still returns 200 ────────────────
  it('returns 200 even when processMessage throws', async () => {
    processMessage.mockRejectedValue(new Error('AI down'));
    const body = makeWebhookBody(`msg-err-${Date.now()}-${Math.random()}`, 'hello');
    const req = createMockReq('POST', {
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.14' },
    });
    const res = createMockRes();
    emitBody(req, body);
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
