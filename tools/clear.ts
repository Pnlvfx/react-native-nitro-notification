import { execa } from 'execa';
import { rimraf } from '@goatjs/rimraf';
import path from 'node:path';

await execa('yarn', ['clean']);
await rimraf(['node_modules', path.join('example', 'node_modules'), 'yarn.lock', path.join('android', 'build')]);
