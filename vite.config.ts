import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: [
        'index.html',
        'rueda.html',
        'rotaciones.html',
        'escenarios.html',
        'mapa.html',
        'asistente.html',
        'ficha.html',
        'guia.html',
      ],
    },
  },
})
