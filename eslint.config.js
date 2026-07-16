import { reactNativeConfigs } from '@goatjs/react-native-eslint';
import { defineConfig, globalIgnores } from '@eslint/config-helpers';

export default defineConfig(
  globalIgnores(['.yarn/**', 'android/**', 'ios/**', 'lib']),
  ...reactNativeConfigs({ tsconfigRootDir: import.meta.dirname }),
  {
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
);
