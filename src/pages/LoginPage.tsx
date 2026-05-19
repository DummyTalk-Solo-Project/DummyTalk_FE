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

// ── Restore Dialog Styles ────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--dt-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--dt-space-6);
  animation: ${fadeRise} var(--dt-dur-base) var(--dt-ease-rise) both;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 340px;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-accent);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  box-shadow: var(--dt-shadow-lg), var(--dt-glow-soft);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
`;

const DialogIcon = styled.p`
  font-size: var(--dt-size-3xl);
  text-align: center;
  margin: 0;
`;

const DialogTitle = styled.h2`
  font-size: var(--dt-size-lg);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0;
  text-align: center;
`;

const DialogBody = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-secondary);
  line-height: var(--dt-leading-relaxed);
  margin: 0;
  text-align: center;
`;

const DialogActions = styled.div`
  display: flex;
  gap: var(--dt-space-3);
  margin-top: var(--dt-space-2);
`;

const RestoreButton = styled.button`
  flex: 1;
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3);
  color: var(--dt-fg-on-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-semibold);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) {
    box-shadow: var(--dt-glow-bloom);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3);
  color: var(--dt-fg-secondary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-strong);
  }
`;

// ── Component ────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLoginSuccess = (data: APIResponse<LoginSuccessDTO>) => {
    const result = data.result;
    if (result?.accessToken) {
      setAuthData(result.accessToken, result.memberName);
      showToast(data.message || '로그인에 성공했습니다.', 'success');
      navigate('/', { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<APIResponse<LoginSuccessDTO>>(
        '/api/members/login',
        { email, password }
      );

      const isLoginSuccess = response.data.isSuccess || response.data.success || response.data.code === 'MEMBER2001';
      if (isLoginSuccess && response.data.result?.accessToken) {
        handleLoginSuccess(response.data);
      } else {
        const msg = response.data.message || '로그인에 실패했습니다. 정보를 다시 확인해주세요.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.code;
        if (code === 'MEMBER4009') {
          // 탈퇴 후 2주 이내 — 복구 다이얼로그 표시
          setShowRestoreDialog(true);
        } else {
          setError(err.response?.data?.message || '로그인 요청 중 문제가 발생했습니다.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const response = await api.patch<APIResponse<LoginSuccessDTO>>(
        '/api/members/restore',
        { email, password }
      );
      const isSuccess = response.data.isSuccess || response.data.code === 'MEMBER2001';
      if (isSuccess && response.data.result?.accessToken) {
        setShowRestoreDialog(false);
        showToast('계정이 복구되었습니다. 환영해요!', 'success');
        handleLoginSuccess(response.data);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.code;
        setShowRestoreDialog(false);
        if (code === 'MEMBER4010') {
          setError('탈퇴 후 2주가 지나 복구가 불가능해요. 새 계정을 만들어주세요.');
        } else {
          setError(err.response?.data?.message || '복구 요청 중 문제가 발생했습니다.');
        }
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      {showRestoreDialog && (
        <Overlay>
          <Dialog>
            <DialogIcon>👻</DialogIcon>
            <DialogTitle>탈퇴한 계정이에요</DialogTitle>
            <DialogBody>
              2주 이내라면 계정을 되살릴 수 있어요!<br />
              지금 계정을 복구하시겠습니까?
            </DialogBody>
            <DialogActions>
              <CancelButton onClick={() => setShowRestoreDialog(false)}>
                취소
              </CancelButton>
              <RestoreButton onClick={handleRestore} disabled={isRestoring}>
                {isRestoring ? '복구 중...' : '복구하기'}
              </RestoreButton>
            </DialogActions>
          </Dialog>
        </Overlay>
      )}
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
    </>
  );
};

export default LoginPage;
