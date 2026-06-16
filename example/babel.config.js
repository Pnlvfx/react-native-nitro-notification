import path from 'node:path';
import { getConfig } from 'react-native-builder-bob/babel-config';
import pkg from '../package.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

export default getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    plugins: ['babel-plugin-react-compiler'],
  },
  { root, pkg }
);
