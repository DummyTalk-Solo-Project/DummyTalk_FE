import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--dt-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--dt-space-6);
  box-sizing: border-box;
`;

const Content = styled.div`
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: var(--dt-space-6);
`;

const Title = styled.h1`
  font-size: var(--dt-size-2xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin-bottom: var(--dt-space-2);
`;

const Message = styled.p`
  font-size: var(--dt-size-md);
  color: var(--dt-fg-secondary);
  margin-bottom: var(--dt-space-4);
  line-height: var(--dt-leading-relaxed);
  word-break: keep-all;
`;

const ErrorCode = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
  margin-bottom: var(--dt-space-8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const RetryButton = styled.button`
  padding: var(--dt-space-3) var(--dt-space-6);
  border-radius: var(--dt-radius-md);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  background: var(--dt-accent);
  color: var(--dt-fg-on-accent);
  border: none;
  &:hover { box-shadow: var(--dt-glow-bloom); transform: translateY(-1px); }
`;

const BackButton = styled.button`
  padding: var(--dt-space-2) var(--dt-space-5);
  border-radius: var(--dt-radius-md);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  background: var(--dt-bg-elevated);
  color: var(--dt-fg-secondary);
  border: 1px solid var(--dt-stroke-soft);
  margin-top: var(--dt-space-8);
  &:hover { border-color: var(--dt-stroke-accent); background: var(--dt-bg-surface); color: var(--dt-fg-primary); }
`;

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { code?: string; message?: string } | null;

  const errorCode = state?.code || 'ERR_UNKNOWN';
  const errorMessage = state?.message || '예상치 못한 오류가 발생했습니다.';

  return (
    <PageContainer>
      <Content>
        <ErrorIcon>⚠️</ErrorIcon>
        <Title>문제가 발생했습니다</Title>
        <Message>{errorMessage}</Message>
        <ErrorCode>CODE: {errorCode}</ErrorCode>
        <RetryButton onClick={() => window.location.reload()}>다시 시도</RetryButton>
        <BackButton onClick={() => navigate(-1)}>← 뒤로 가기</BackButton>
      </Content>
    </PageContainer>
  );
};

export default ErrorPage;
