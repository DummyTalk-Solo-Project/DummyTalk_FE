// src/utils/auth.ts
export const TOKEN_KEY = 'accessToken';
export const USERNAME_KEY = 'username'; // 메인 페이지에서 사용할 닉네임 키

// JWT 페이로드 디코딩 (서명 검증 없이 클레임만 추출)
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
};

// 1. 토큰 저장 (로그인 성공 시)
export const setAuthData = (token: string, username : string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
};

// 2. 토큰 가져오기 (API 요청 시)
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
// 2. 닉네임 가져오기
export const getUsername = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

// 3. 토큰 삭제 (로그아웃 시)
export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

// 4. 로그인 상태 확인 (토큰 존재 여부)
export const isLoggedIn = (): boolean => {
    return !!getAccessToken();
};

// 5. Admin 권한 확인 (JWT 클레임의 role 필드 기반)
export const isAdmin = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const role = payload.role ?? payload.roles;
  if (Array.isArray(role)) return role.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN');
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
};