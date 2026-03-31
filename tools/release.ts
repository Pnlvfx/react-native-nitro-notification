import { execa } from 'execa';

await execa('yarn', ['typecheck']);
await execa('yarn', ['lint']);
// await execa('yarn', ['version', 'minor']);
await execa('yarn', ['prepare']);
await execa('yarn', ['npm', 'publish']);
