import { execa } from 'execa';

const rootDir =
  '/Users/simonegauli/Desktop/packages/react-native-nitro-notification';
const exampleDir = `${rootDir}/example`;

// Reset watchman for root
await execa('watchman', ['watch-del', rootDir], { stdio: 'inherit' });
await execa('watchman', ['watch-project', rootDir], { stdio: 'inherit' });

// Reset watchman for example
await execa('watchman', ['watch-del', exampleDir], { stdio: 'inherit' });
await execa('watchman', ['watch-project', exampleDir], { stdio: 'inherit' });

await execa('node_modules/.bin/react-native', ['start'], { stdio: 'inherit' });
