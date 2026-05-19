// src/api/axiosInstance.ts

import axios, { type AxiosInstance } from 'axios';
import { getAccessToken, removeAccessToken } from '../utils/auth';

// Vite 환경 변수에서 API 기본 URL 설정 (local proxy 또는 EC2 주소)
// 환경 변수가 없을 경우 상대 경로를 사용하며, vite.config.ts의 proxy 설정이 작동함
const BASE_URL = import.meta.env.VITE_API_URL || ''; 

// 1. Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL, 
  timeout: 5000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. [요청 Interceptor]: 모든 요청에 JWT 자동 삽입
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // LocalStorage에서 순수 토큰 값 가져오기
    const url = config.url || '';

    // 로그인 및 회원가입 관련 API는 Authorization 헤더를 보내지 않음
    const isAuthPath = url.includes('/login') || 
                       url.includes('/sign-in') || 
                       url.includes('/email-verification') || 
                       url.includes('/verify');

    if (token && !isAuthPath) {
      // ⭐️ 백엔드 필터 수정사항 적용: 'Bearer: ' 형식
      config.headers.Authorization = `Bearer: ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. [응답 Interceptor]: JWT 만료 등 인증 오류(401) 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeAccessToken();
            // 현재 경로가 이미 로그인 페이지가 아닐 때만 리다이렉트
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;