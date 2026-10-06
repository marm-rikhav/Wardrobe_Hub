import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const removeTestIds = () => ({
  name: 'remove-test-ids',
  apply: 'build',
  transform(code, id) {
    if (id.includes('node_modules')) return null;
    let transformed = code
      .replaceAll(/["']?data-testid["']?\s*:\s*["`'][^"`']*["`'],?\s*/g, '')
      .replaceAll(/data-testid\s*=\s*({[^}]*}|"[^"]*"|'[^']*')\s*/g, '');
    return {
      code: transformed,
      map: null,
    };
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: isProduction
            ? [['react-remove-properties', { properties: ['data-testid'] }]]
            : [],
        },
      }),
      ...(isProduction ? [removeTestIds()] : []),
    ],
    server: {
      port: 3000,
      open: false,
    },
  };
});
