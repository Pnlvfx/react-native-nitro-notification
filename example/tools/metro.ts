import { execa } from 'execa';
import { execAsync } from '@goatjs/node/exec';

await execAsync(
  "watchman watch-del '/Users/simonegauli/Desktop/packages/react-native-nitro-notification' ; watchman watch-project '/Users/simonegauli/Desktop/packages/react-native-nitro-notification'"
);
await execa('node_modules/.bin/react-native', ['start'], { stdio: 'inherit' });
