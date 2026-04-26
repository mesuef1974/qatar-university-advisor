/**
 * WhatsApp Cloud API — retry/backoff smoke tests
 * Verifies sendPayload retries on 5xx/429/network errors and gives up on 4xx.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Module under test imports happen lazily inside tests to allow env setup
async function loadModule() {
  vi.resetModules();
  return await import('../../lib/whatsapp.ts');
}

function jsonResponse(status, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('whatsapp.sendPayload retry policy', () => {
  let fetchMock;

  beforeEach(() => {
    process.env.WHATSAPP_PHONE_ID = 'test_phone';
    process.env.WHATSAPP_TOKEN = 'test_token';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns immediately on 200 (no retry)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { messages: [{ id: 'wamid' }] }));

    const { sendTextMessage } = await loadModule();
    await sendTextMessage('974XXXXXXX', 'hi');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries on 503 then succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(503, { error: 'transient' }))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    const { sendTextMessage } = await loadModule();
    await sendTextMessage('974XXXXXXX', 'hi');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('does NOT retry on 401 (unauthorized — token expired)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: 'invalid token' }));

    const { sendTextMessage } = await loadModule();
    await expect(sendTextMessage('974XXXXXXX', 'hi')).rejects.toThrow(/401/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 (rate limited)', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(429, { error: 'rate limit' }))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    const { sendTextMessage } = await loadModule();
    await sendTextMessage('974XXXXXXX', 'hi');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('gives up after 3 attempts on persistent 500', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, { error: 'always broken' }));

    const { sendTextMessage } = await loadModule();
    await expect(sendTextMessage('974XXXXXXX', 'hi')).rejects.toThrow(/500/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 15000);

  it('retries on network error (thrown exception)', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    const { sendTextMessage } = await loadModule();
    await sendTextMessage('974XXXXXXX', 'hi');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 10000);

  it('throws original network error after exhausting retries', async () => {
    fetchMock.mockRejectedValue(new Error('ETIMEDOUT'));

    const { sendTextMessage } = await loadModule();
    await expect(sendTextMessage('974XXXXXXX', 'hi')).rejects.toThrow(/ETIMEDOUT/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 15000);
});
