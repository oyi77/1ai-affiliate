import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/admin/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
})
