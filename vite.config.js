import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',   // simula o DOM do navegador para os testes
    globals: true,          // disponibiliza describe/it/expect sem importar
  },
})
