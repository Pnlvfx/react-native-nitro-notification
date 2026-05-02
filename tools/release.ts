import { execa } from 'execa';
import fs from 'node:fs/promises';
import path from 'node:path';

await execa('yarn', ['tsc'], { stdio: 'inherit' });
await execa('yarn', ['lint'], { stdio: 'inherit' });
await execa('yarn', ['version', 'minor'], { stdio: 'inherit' });
await execa('yarn', ['prepare'], { stdio: 'inherit' });

const raw = await fs.readFile(path.resolve('package.json'), 'utf8');
const pkg = JSON.parse(raw) as { version: string };
const tag = `v${pkg.version}`;

await execa('git', ['add', '-A'], { stdio: 'inherit' });
await execa('git', ['commit', '-m', `chore(release): ${tag}`], {
  stdio: 'inherit',
});
await execa('git', ['tag', tag], { stdio: 'inherit' });

await execa('yarn', ['npm', 'publish'], { stdio: 'inherit' });
