// src/utils/auth.ts
export const TOKEN_KEY = 'accessToken';

// 1. 토큰 저장 (로그인 성공 시)
export const setAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 2. 토큰 가져오기 (API 요청 시)
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 3. 토큰 삭제 (로그아웃 시)
export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// 4. 로그인 상태 확인 (토큰 존재 여부)
export const isLoggedIn = (): boolean => {
    // 토큰이 존재하고 만료되지 않았는지 추가 확인 로직이 필요하지만, 
    // 현재는 존재 여부만으로 판단합니다.
    return !!getAccessToken(); 
}