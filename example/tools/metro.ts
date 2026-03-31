import { execa } from 'execa';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

await execAsync(
  "watchman watch-del '/Users/simonegauli/Desktop/packages/react-native-nitro-notification' ; watchman watch-project '/Users/simonegauli/Desktop/packages/react-native-nitro-notification'"
);
await execa('node_modules/.bin/react-native', ['start'], { stdio: 'inherit' });
