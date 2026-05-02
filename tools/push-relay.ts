import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = process.env.PUSH_RELAY_PORT ?? '8765';
const DEFAULT_BUNDLE_ID =
  process.env.PUSH_BUNDLE_ID ?? 'nitronotification.example';

const findBootedUDID = (): string => {
  const raw = execSync('xcrun simctl list devices booted --json', {
    encoding: 'utf8',
  });
  const parsed = JSON.parse(raw) as {
    devices: Record<string, Array<{ state: string; udid: string }>>;
  };
  for (const devices of Object.values(parsed.devices)) {
    for (const device of devices) {
      if (device.state === 'Booted') return device.udid;
    }
  }
  throw new Error('No booted simulator found. Boot one first.');
};

const buildPayload = (input: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) => ({
  aps: {
    alert: { title: input.title, body: input.body },
    sound: 'default',
  },
  ...(input.data ?? {}),
});

const handlePush = (
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse
) => {
  let raw = '';
  req.on('data', (chunk: Buffer) => {
    raw += chunk.toString();
  });
  req.on('end', () => {
    try {
      const input = JSON.parse(raw) as {
        title: string;
        body: string;
        bundleId?: string;
        data?: Record<string, string>;
      };
      const udid = findBootedUDID();
      const payload = buildPayload(input);
      const bundleId = input.bundleId ?? DEFAULT_BUNDLE_ID;
      const tmpFile = join(tmpdir(), `push-${Date.now()}.json`);
      writeFileSync(tmpFile, JSON.stringify(payload));
      execSync(`xcrun simctl push ${udid} ${bundleId} ${tmpFile}`, {
        encoding: 'utf8',
      });
      unlinkSync(tmpFile);
      console.log(`[push-relay] sent "${input.title}" to ${udid}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, udid }));
    } catch (err) {
      console.error('[push-relay] error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
  });
};

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/push') return handlePush(req, res);
  res.writeHead(404);
  res.end();
});

server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`[push-relay] listening on http://127.0.0.1:${PORT}`);
});
