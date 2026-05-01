import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import { setAuthData } from '../utils/auth';
import { useToast } from '../components/Toast';
import type { APIResponse, LoginSuccessDTO } from '../types/api';

// ── Animations ───────────────────────────────────────────────
const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Layout ───────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--dt-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dt-space-6);
  box-sizing: border-box;
`;

const Card = styled.form`
  width: 100%;
  max-width: 360px;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-10) var(--dt-space-8);
  box-shadow: var(--dt-shadow-lg), var(--dt-inset-highlight);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const CardLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: 0;
  text-align: center;
`;

const CardTitle = styled.h1`
  font-size: var(--dt-size-2xl);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-tight);
  color: var(--dt-fg-primary);
  margin: 0 0 var(--dt-space-2);
  text-align: center;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--dt-stroke-faint);
  margin: var(--dt-space-2) 0;
`;

const Input = styled.input`
  width: 100%;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);
  box-sizing: border-box;

  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
  outline: none;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap);

  &::placeholder {
    color: var(--dt-fg-disabled);
  }

  &:focus {
    border-color: var(--dt-stroke-accent);
    box-shadow: 0 0 0 3px rgba(154, 123, 240, 0.12);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4);
  margin-top: var(--dt-space-2);

  color: var(--dt-fg-on-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-md);
  font-weight: var(--dt-weight-semibold);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) {
    box-shadow: var(--dt-glow-bloom);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-danger);
  margin: 0;
  text-align: center;
  line-height: var(--dt-leading-snug);
`;

const FooterLink = styled(Link)`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  text-align: center;
  text-decoration: none;
  transition: color var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-accent);
  }
`;

// ── Component ────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<APIResponse<LoginSuccessDTO>>(
        '/api/members/login',
        { email, password }
      );

      const result = response.data.result;
      const isLoginSuccess = response.data.isSuccess || response.data.success || response.data.code === 'MEMBER2001';

      if (isLoginSuccess && result?.accessToken) {
        // 토큰과 유저 정보를 먼저 저장
        setAuthData(result.accessToken, result.memberName);
        
        // 피드백 제공 후 이동
        showToast(response.data.message || '로그인에 성공했습니다.', 'success');
        
        // 약간의 지연 없이 즉시 이동 (replace: true로 뒤로가기 방지)
        navigate('/', { replace: true });
      } else {
        const errorMsg = response.data.message || '로그인에 실패했습니다. 정보를 다시 확인해주세요.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || '로그인 요청 중 문제가 발생했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <Card onSubmit={handleLogin}>
        <CardLabel>◈ MEMBER ACCESS</CardLabel>
        <CardTitle>로그인</CardTitle>
        <Divider />
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? '인증 중...' : '로그인'}
        </SubmitButton>
        <FooterLink to="/sign-in">계정이 없으신가요? 회원가입</FooterLink>
      </Card>
    </Page>
  );
};

export default LoginPage;
