import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import { useToast } from '../components/Toast';
import type { APIResponse, SignInRequestDTO, VerificationRequestDTO } from '../types/api';

// ── Animations ───────────────────────────────────────────────
const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; transform: translateY(-10px); }
  to   { opacity: 1; max-height: 80px; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ── Shared Styled Components ─────────────────────────────────
const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--dt-stroke-soft);
  border-top-color: var(--dt-accent);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const SpinnerOverlay = styled.div`
  position: absolute;
  right: var(--dt-space-3);
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  color: var(--dt-fg-tertiary);
  font-size: var(--dt-size-xs);
`;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Row = styled.div`
  display: flex;
  gap: var(--dt-space-2);
  align-items: stretch;
`;

const ActionButton = styled.button`
  flex-shrink: 0;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-accent);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);

  color: var(--dt-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) {
    background: var(--dt-accent-soft);
    box-shadow: var(--dt-glow-soft);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const AnimatedRow = styled(Row)`
  animation: ${slideDown} 0.4s var(--dt-ease-rise) forwards;
  overflow: hidden;
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

const StatusMsg = styled.p<{ $isError?: boolean }>`
  font-size: var(--dt-size-sm);
  color: ${({ $isError }) =>
    $isError ? 'var(--dt-danger)' : 'var(--dt-success)'};
  margin: 0;
  text-align: center;
  line-height: var(--dt-leading-snug);
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
  padding: var(--dt-space-3) var(--dt-space-4);
  background: rgba(111, 217, 168, 0.08);
  border: 1px solid rgba(111, 217, 168, 0.25);
  border-radius: var(--dt-radius-md);

  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-success);
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
const SignInPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageError, setIsMessageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const requestEmailVerification = async () => {
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      setIsMessageError(true);
      return;
    }
    setMessage('');
    setIsEmailSending(true);
    // 즉시 입력 칸을 보여주기 위해 상태 업데이트 (JSX에서 isEmailSending || isEmailSent 로 처리)
    
    try {
      const res = await api.get<APIResponse<boolean>>(
        '/api/members/email-verification',
        { params: { email } }
      );
      
      const resData = res.data;
      // 보다 명확한 성공 판정: isSuccess가 true이거나 특정 성공 코드가 온 경우
      const isSuccess = resData.isSuccess === true || resData.code === 'MEMBER2004' || (resData as any).success === true;

      if (isSuccess) {
        setIsEmailSent(true);
        setMessage(resData.message || '인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
        setIsMessageError(false);
      } else {
        // 실패 시에도 입력 칸은 유지하되 에러 메시지 표시
        setMessage(resData.message || '이메일 발송에 실패했습니다.');
        setIsMessageError(true);
      }
    } catch (err) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || '이메일 발송에 실패했습니다.'
        : '이메일 발송에 실패했습니다.';
      setMessage(msg);
      setIsMessageError(true);
    } finally {
      setIsEmailSending(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      setMessage('인증 코드를 입력해주세요.');
      setIsMessageError(true);
      return;
    }
    setMessage('');

    const body: VerificationRequestDTO = { email, code: verificationCode };
    try {
      const res = await api.post<APIResponse<boolean>>('/api/members/verify', body);
      if (res.data.isSuccess || res.data.success || res.data.code === 'MEMBER2005') {
        setIsEmailVerified(true);
        setMessage('');
        showToast(res.data.message || '이메일 인증에 성공했습니다.', 'success');
      } else {
        setMessage(res.data.message || '인증에 실패했습니다.');
        setIsMessageError(true);
      }
    } catch (err) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || '인증 코드 확인 중 문제가 발생했습니다.'
        : '인증 코드 확인 중 문제가 발생했습니다.';
      setMessage(msg);
      setIsMessageError(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setMessage('이메일 인증을 완료해주세요.');
      setIsMessageError(true);
      return;
    }
    setMessage('');
    setIsLoading(true);

    const body: SignInRequestDTO = { username, email, password };
    try {
      const res = await api.post<APIResponse<boolean>>('/api/members/sign-in', body);
      if (res.data.isSuccess || res.data.success || res.data.code === 'MEMBER2003') {
        showToast(res.data.message || '회원가입에 성공했습니다!', 'success');
        navigate('/login');
      } else {
        setMessage(res.data.message || '회원가입에 실패했습니다.');
        setIsMessageError(true);
      }
    } catch (err) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || '회원가입 요청 중 문제가 발생했습니다.'
        : '회원가입 요청 중 문제가 발생했습니다.';
      setMessage(msg);
      setIsMessageError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <Card onSubmit={handleSignIn}>
        <CardLabel>◈ NEW MEMBER</CardLabel>
        <CardTitle>회원가입</CardTitle>
        <Divider />

        {/* 이메일 + 인증 버튼 */}
        <Row>
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEmailVerified}
            style={{ flex: 1 }}
          />
          <ActionButton
            type="button"
            onClick={requestEmailVerification}
            disabled={isEmailVerified || isEmailSent || isEmailSending}
          >
            {isEmailSending ? '발송 중...' : '인증 코드 발송'}
          </ActionButton>
        </Row>

        {/* 인증 코드 입력 (이메일 발송 중이거나 발송 후) */}
        {(isEmailSending || isEmailSent) && !isEmailVerified && (
          <AnimatedRow>
            <InputWrapper>
              <Input
                type="text"
                placeholder="인증 코드 4자리"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isEmailSending}
                style={{ flex: 1 }}
              />
              {isEmailSending && (
                <SpinnerOverlay>
                  <LoadingSpinner />
                </SpinnerOverlay>
              )}
            </InputWrapper>
            <ActionButton 
              type="button" 
              onClick={verifyCode}
              disabled={isEmailSending}
            >
              확인
            </ActionButton>
          </AnimatedRow>
        )}

        {/* 인증 완료 뱃지 */}
        {isEmailVerified && (
          <VerifiedBadge>✓ 이메일 인증 완료</VerifiedBadge>
        )}

        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="닉네임"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {message && (
          <StatusMsg $isError={isMessageError}>{message}</StatusMsg>
        )}

        {isEmailVerified && (
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : '회원가입 하기'}
          </SubmitButton>
        )}

        <FooterLink to="/login">이미 계정이 있으신가요? 로그인</FooterLink>
      </Card>
    </Page>
  );
};

export default SignInPage;
