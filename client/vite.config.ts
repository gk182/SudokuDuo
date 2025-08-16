import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // cho phép truy cập từ LAN/ngrok
    port: 5173, // hoặc port bạn muốn
    allowedHosts: [
      '6c48e77dc254.ngrok-free.app', // thêm host ngrok
      'localhost',
      '127.0.0.1'
    ]
  }
  
})
