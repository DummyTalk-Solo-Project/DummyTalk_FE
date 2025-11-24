// pages/SignInPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import type { APIResponse, SignInRequestDTO, VerificationRequestDTO } from '../types/api.tsx';

// (Styled Components는 LoginPage.tsx의 AuthContainer, Card, Input, AuthButton, ErrorMessage 재활용)
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


const SignInPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 1. 이메일 인증 요청 (GET /api/users/email-verification)
  const requestEmailVerification = async () => {
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      return;
    }
    setMessage('');
    try {
      // NOTE: Query Parameter 사용
      await axios.get(`/api/users/email-verification?email=${email}`);
      setIsEmailSent(true);
      setMessage('인증 코드가 이메일로 발송되었습니다. 확인 후 입력해주세요.');
    } catch (err) {
      setMessage('이메일 발송에 실패했습니다. 이메일을 다시 확인해주세요.');
    }
  };

  // 2. 인증 코드 확인 (POST /api/users/verify)
  const verifyCode = async () => {
    if (!verificationCode) {
      setMessage('인증 코드를 입력해주세요.');
      return;
    }
    setMessage('');

    const requestBody: VerificationRequestDTO = { email, code: verificationCode };

    try {
      const response = await axios.post<APIResponse<boolean>>("/api/users/verify", requestBody);
      
      if (response.data.success) {
        setIsEmailVerified(true);
        setMessage('인증 성공!');
      } else {
        // 서버에서 '제가 보낸 이메일이랑...' 메세지를 응답 메시지(message) 필드에 담아줘야 합니다.
        setMessage(response.data.message || '인증 코드 확인에 실패했습니다. 다시 확인해주세요.');
      }
    } catch (err) {
      setMessage('인증 코드 확인 중 문제가 발생했습니다.');
      console.error(err);
    }
  };

  // 3. 최종 회원가입 (POST /api/users/sign-in)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const requestBody: SignInRequestDTO = { username, email, password };
    
    try {
      const response = await axios.post<APIResponse<boolean>>("/api/users/sign-in", requestBody);
      
      if (response.data.success) {
        alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        navigate("/login"); 
      } else {
        setMessage(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setMessage('회원가입 요청 중 문제가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <AuthContainer>
      <Card as="form" onSubmit={handleSignIn}>
        <h2>회원가입</h2>
        
        <Input type="text" placeholder="사용자 닉네임" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <Input type="password" placeholder="패스워드" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        {/* 이메일 입력 및 인증 요청 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input 
            type="email" 
            placeholder="사용자 이메일" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={isEmailVerified}
          />
          <AuthButton type="button" onClick={requestEmailVerification} disabled={isEmailVerified || isEmailSent}>
            이메일 인증
          </AuthButton>
        </div>

        {/* 인증 코드 입력 (동적으로 띄움) */}
        {isEmailSent && !isEmailVerified && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input 
              type="text" 
              placeholder="인증 코드 입력" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              required
            />
            <AuthButton type="button" onClick={verifyCode}>
              인증
            </AuthButton>
          </div>
        )}

        {/* 인증 성공 시 버튼 내용 변경 */}
        {isEmailVerified && (
            <AuthButton type="button" disabled style={{ backgroundColor: '#B8CFCE', color: '#333446' }}>
                인증 성공!
            </AuthButton>
        )}

        {message && <ErrorMessage>{message}</ErrorMessage>}

        {/* 최종 회원가입 버튼 (인증 성공 시 동적으로 띄움) */}
        {isEmailVerified && (
          <AuthButton type="submit">회원가입 하기</AuthButton>
        )}

      </Card>
    </AuthContainer>
  );
};

export default SignInPage;