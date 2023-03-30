import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: 8080,
    open: true,
    proxy: {
      '/dev-api': {
        target: 'https://www.xiaoxigo.top',
        changeOrigin: true,
        rewrite: (path) => path.replace('/dev-api', '/')
      }
    }
  },
  //配置@符
  resolve:{
    alias:{
      "@": path.join(__dirname,"src")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全部都追加
        additionalData: "@import '@/assets/style/core/_base.scss';",
      }
    }
  },
})
