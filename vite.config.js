import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject build-time environment variables from netlify.toml
    __SQUARE_APP_ID__: JSON.stringify(process.env.SQUARE_APP_ID || ''),
    __SQUARE_LOCATION_ID__: JSON.stringify(process.env.SQUARE_LOCATION_ID || ''),
    __SQUARE_ENVIRONMENT__: JSON.stringify(process.env.SQUARE_ENVIRONMENT || 'sandbox'),
  },
})
