import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'NEXT_PUBLIC_');
  return {
    base: '/grimoireelder/',
    css: { postcss: { plugins: [tailwindcss()] } },
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(''),
    },
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    },
    build: { outDir: 'pages-dist', emptyOutDir: true },
  };
});
