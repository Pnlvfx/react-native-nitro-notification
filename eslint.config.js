import { reactNativeConfigs } from "@goatjs/react-native-eslint";
import { defineConfig, globalIgnores } from "@eslint/config-helpers";

// TODO move the rules on the eslint package or remove them

export default defineConfig(
  globalIgnores([".yarn/**", "android/**", "ios/**", "lib"]),
  ...reactNativeConfigs({ tsconfigRootDir: import.meta.dirname }),
);
