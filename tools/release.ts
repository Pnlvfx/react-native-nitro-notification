import { execa } from 'execa';

await execa('yarn', ['tsc'], { stdio: 'inherit' });
await execa('yarn', ['lint'], { stdio: 'inherit' });
await execa('yarn', ['version', 'minor'], { stdio: 'inherit' });
await execa('yarn', ['prepare'], { stdio: 'inherit' });
await execa('yarn', ['npm', 'publish'], { stdio: 'inherit' });
