import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api 경로로 시작하는 모든 요청을
      '/api': {
        // 백엔드 서버 주소로 전달
        target: 'http://localhost:8080', 
        // 호스트 헤더 변경 (선택 사항이지만 권장)
        changeOrigin: true, 
        // (선택 사항) HTTPS -> HTTP로 리다이렉트가 필요할 경우
        // secure: false,
      },
    },
  },
})


