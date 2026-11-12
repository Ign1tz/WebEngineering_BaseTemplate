import process from 'node:process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const target = process.env.API_PROXY_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/bears': { target },
      '/api/comments': { target },
      '/api/docs': { target },
      '/api/health': {
        target,
        rewrite: () => '/health',
      },
    },
  },
});