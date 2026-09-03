import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Segredo fixo só para os testes. Não tem relação com nenhum ambiente real.
    env: {
      APP_SECRET: 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
