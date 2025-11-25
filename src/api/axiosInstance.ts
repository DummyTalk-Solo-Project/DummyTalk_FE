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

    if (token) {
      // ⭐️ 백엔드 필터 수정사항 적용: 표준 형식 'Bearer: '
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
        // HTTP 상태 코드 401 (Unauthorized) 체크
        if (error.response?.status === 401) {
            console.error("Authentication failed (401). JWT may be expired or invalid.");
            
            // 로컬 토큰 삭제
            removeAccessToken();
            
            // 사용자에게 알림 (선택 사항)
            alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
            
            // 로그인 페이지로 강제 리다이렉트 (⚠️주의: 실제 프로젝트에서는 navigate를 직접 쓰기 어려우므로, 
            // 별도 상태 관리 툴이나 window.location을 사용하거나 
            // 컴포넌트 내부에서 에러를 처리하는 것이 더 일반적입니다. 여기서는 일단 로컬 정리만 합니다.)
            // window.location.href = "/login"; 
        }
        return Promise.reject(error);
    }
);

export default api;