// src/api/axiosInstance.ts

import axios, { type AxiosInstance } from 'axios';
import { getAccessToken, removeAccessToken, setAuthData, getUsername } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// 1. Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  withCredentials: true, // RT HttpOnly 쿠키 자동 전송 (크로스 도메인 포함)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. [요청 Interceptor]: 모든 요청에 JWT 자동 삽입
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const url = config.url || '';

    const isAuthPath = url.includes('/login') ||
                       url.includes('/sign-in') ||
                       url.includes('/email-verification') ||
                       url.includes('/verify');

    if (token && !isAuthPath) {
      // RFC 6750 표준: "Bearer <token>" — 콜론 없음
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. [응답 Interceptor]: AT 자동 갱신 + 인증 오류 처리
api.interceptors.response.use(
  (response) => {
    // BE 필터가 AT를 갱신하면 Authorization 헤더로 새 토큰을 내려줌
    const newToken = response.headers['authorization'];
    if (newToken?.startsWith('Bearer ')) {
      const token = newToken.slice(7);
      const username = getUsername() ?? '';
      setAuthData(token, username);
    }
    return response;
  },
  (error) => {
    const code = error.response?.data?.code as string | undefined;

    // RT 없음/만료 → 강제 로그아웃
    if (code === 'SERVER_4104' || code === 'SERVER_4103') {
      removeAccessToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // AT 없음 → 로그인 페이지로
    if (code === 'SERVER_4100') {
      removeAccessToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;