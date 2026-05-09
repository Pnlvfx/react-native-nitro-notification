import { execa } from 'execa';
import path from 'node:path';
import { createPushRelay } from './push-relay.ts';

const EXAMPLE_DIR = path.resolve(import.meta.dirname, '..');
const MAESTRO_DIR = path.join(EXAMPLE_DIR, '.maestro');
const RELAY_PORT = process.env.PUSH_RELAY_PORT ?? '8765';

const startRelay = async (): Promise<{ stop: () => Promise<void> }> => {
  const server = createPushRelay();
  await new Promise<void>((resolve) => {
    server.listen(Number(RELAY_PORT), '127.0.0.1', resolve);
  });
  console.log(`[push-relay] listening on http://127.0.0.1:${RELAY_PORT}`);
  return {
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
};

const runMaestroTests = async (): Promise<void> => {
  const flows = [
    '01_permissions_denied.yaml',
    '02_permissions_granted.yaml',
    '03_foreground_notification.yaml',
    '04_background_notification.yaml',
  ];

  for (const flow of flows) {
    console.log(`\n[maestro] running ${flow}...`);
    await execa('maestro', ['test', path.join(MAESTRO_DIR, flow)], {
      cwd: EXAMPLE_DIR,
      stdio: 'inherit',
    });
  }
};

const main = async (): Promise<void> => {
  console.log('[maestro] starting push relay...');
  const relay = await startRelay();

  try {
    console.log('[maestro] running tests...');
    await runMaestroTests();
    console.log('[maestro] all tests passed');
  } catch (err) {
    console.error('[maestro] test run failed:', err);
    process.exitCode = 1;
  } finally {
    console.log('[maestro] stopping push relay...');
    await relay.stop();
  }
};

await main();
