import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // 로컬 개발용 proxy 대상:
  //   .env.local에 VITE_DEV_API_URL 설정 시 해당 주소로 포워딩
  //   없으면 배포 BE 서버 (https://ddotg.dev) 사용
  const devTarget = env.VITE_DEV_API_URL || 'https://ddotg.dev';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: devTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
