// pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { setAccessToken } from '../utils/auth';
import type { APIResponse } from '../types/api';

// --- Styled Components (디자인은 MainPage 참고) ---
const AuthContainer = styled.div`
  /* ... MainContainer와 유사한 배경/중앙 정렬 스타일 ... */
  background-color: #333446;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background-color: #B8CFCE; /* 서브 색상 2로 카드 배경 */
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #7F8CAA;
  border-radius: 5px;
  background-color: #EAEFEF;
  color: #333446;
`;

const AuthButton = styled.button`
  background-color: #7F8CAA;
  color: #EAEFEF;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover { background-color: #B8CFCE; color: #333446; }
`;

const ErrorMessage = styled.p`
  color: #ff5555;
  font-size: 0.9em;
  text-align: center;
`;
// --- LoginPage 컴포넌트 ---
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 🚨 주의: 백엔드는 JWT를 응답 Header (Authorization)에 담아줍니다.
      const response = await axios.post<APIResponse<boolean>>("/api/users/login", { email, password });

      // JWT가 Header에 있다면, 여기서 추출해야 합니다.
      const jwtToken = response.headers['authorization']; // 소문자로 접근해야 함 (브라우저가 자동 소문자화)
      
      if (response.data.success && jwtToken) {
        // 'Bearer: ' 접두사 제거
        const token = jwtToken.replace('Bearer: ', '');
        setAccessToken(token); // 로컬 저장소에 JWT 저장
        
        // 로그인 성공 시 메인 페이지로 리다이렉트
        navigate("/", { replace: true }); 
      } else {
        // success가 false일 때 서버 메시지 표시
        setError(response.data.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      // Axios 에러 처리 (4xx, 5xx 에러)
      setError('로그인 요청 중 문제가 발생했습니다. 서버 상태를 확인해주세요.');
      console.error(err);
    }
  };

  return (
    <AuthContainer>
      <Card as="form" onSubmit={handleLogin}>
        <h2>로그인</h2>
        <Input 
          type="email" 
          placeholder="사용자 이메일" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <Input 
          type="password" 
          placeholder="패스워드" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <AuthButton type="submit">로그인</AuthButton>
        <Link to="/sign-in" style={{ textAlign: 'center', fontSize: '0.9em', color: '#333446' }}>
          계정이 없으신가요?
        </Link>
      </Card>
    </AuthContainer>
  );
};

export default LoginPage;