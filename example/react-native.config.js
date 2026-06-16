import path from 'node:path';
import pkg from '../package.json' with { type: 'json' };

export default {
  dependencies: {
    [pkg.name]: {
      root: path.join(import.meta.dirname, '..'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        android: {},
      },
    },
  },
};
