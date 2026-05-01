import React, { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, QuizResponseDTO } from '../types/api';
import { useToast } from '../components/Toast';

// ── Animations ───────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const glitchShake = keyframes`
  0%, 100% { transform: translate(0,0); }
  20%      { transform: translate(-1px, 1px); }
  40%      { transform: translate(1px, -1px); }
  60%      { transform: translate(-1px, -1px); }
  80%      { transform: translate(1px, 1px); }
`;

// ── Layout ───────────────────────────────────────────────────
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--dt-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px var(--dt-space-6) var(--dt-space-10);
  box-sizing: border-box;
`;

const Content = styled.div`
  width: 100%;
  max-width: var(--dt-content-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-5);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

// ── State UI atoms ───────────────────────────────────────────
const GhostEmoji = styled.div`
  font-size: 64px;
  line-height: 1;
  animation: ${float} 4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  user-select: none;
`;

const GlitchLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-medium);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  animation: ${glitchShake} 0.45s ease infinite;
  margin: 0;
`;

const StateTitle = styled.h2`
  font-size: var(--dt-size-xl);
  font-weight: var(--dt-weight-semibold);
  line-height: var(--dt-leading-snug);
  letter-spacing: var(--dt-tracking-tight);
  color: var(--dt-fg-primary);
  margin: 0;
  text-align: center;
`;

const StateSubtitle = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  margin: 0;
  text-align: center;
  line-height: var(--dt-leading-normal);
  word-break: keep-all;
`;

const RetryButton = styled.button`
  background: transparent;
  border: 1px solid var(--dt-stroke-accent);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-6);
  color: var(--dt-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  margin-top: var(--dt-space-2);

  &:hover {
    background: var(--dt-accent-soft);
    box-shadow: var(--dt-glow-soft);
  }
`;

// ── Quiz Card ────────────────────────────────────────────────
const QuizCard = styled.div`
  width: 100%;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  box-shadow: var(--dt-shadow-md), var(--dt-inset-highlight);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-6);
  box-sizing: border-box;
`;

const QuizLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-medium);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: 0;
`;

const QuizTitle = styled.h1`
  font-size: var(--dt-size-lg);
  font-weight: var(--dt-weight-semibold);
  line-height: var(--dt-leading-snug);
  color: var(--dt-fg-primary);
  margin: 0;
  text-align: center;
  word-break: keep-all;
`;

const AnswerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  max-height: 45vh;
  overflow-y: auto;
`;

const AnswerButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  background: ${({ $selected }) =>
    $selected ? 'var(--dt-accent-soft)' : 'var(--dt-bg-elevated)'};
  border: 1px solid
    ${({ $selected }) =>
      $selected ? 'var(--dt-stroke-accent)' : 'var(--dt-stroke-soft)'};
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4) var(--dt-space-5);

  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
  font-weight: ${({ $selected }) =>
    $selected ? 'var(--dt-weight-medium)' : 'var(--dt-weight-regular)'};
  line-height: var(--dt-leading-normal);
  text-align: left;
  cursor: pointer;
  white-space: normal;
  word-break: keep-all;

  box-shadow: ${({ $selected }) =>
    $selected ? 'var(--dt-glow-soft)' : 'none'};
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) {
    border-color: var(--dt-stroke-accent);
    box-shadow: var(--dt-glow-soft);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4) var(--dt-space-6);

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

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

// ── Glitch loading strings ───────────────────────────────────
const GLITCH_STRINGS = [
  'CONNECTING TO GHOST NETWORK...',
  '▓▒░ LOADING TRANSMISSION ░▒▓',
  'エラー... 存在確認中...',
  '░░░ SIGNAL ACQUIRED ░░░',
  '데이터 수신 중...',
];

// ── Component ────────────────────────────────────────────────
const QuizPage: React.FC = () => {
  const [quizData, setQuizData] = useState<QuizResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoQuiz, setIsNoQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [glitchText, setGlitchText] = useState(GLITCH_STRINGS[0]);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 로딩 중 글리치 텍스트 사이클링
  useEffect(() => {
    if (!isLoading) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % GLITCH_STRINGS.length;
      setGlitchText(GLITCH_STRINGS[idx]);
    }, 550);
    return () => clearInterval(id);
  }, [isLoading]);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setIsNoQuiz(false);
    setError(null);
    setSelectedIndex(null);
    try {
      const res: AxiosResponse<APIResponse<QuizResponseDTO>> =
        await api.get('/api/dummies/quiz');
      if (res.data.isSuccess || res.data.success) {
        setQuizData(res.data.result);
      } else {
        setError(res.data.message || '퀴즈 정보를 불러오지 못했어요.');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.code as string | undefined;
        if (code === 'DUMMY4003') {
          // 열린 퀴즈 없음 — 에러 상태가 아닌 준비 중 상태
          setIsNoQuiz(true);
        } else {
          setError(
            err.response?.data?.message || '퀴즈 정보를 불러오지 못했어요.'
          );
        }
      } else {
        setError('알 수 없는 오류가 발생했어요.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedIndex === null || !quizData?.quizId) return;

    setIsSubmitting(true);
    try {
      const res: AxiosResponse<APIResponse<boolean>> = await api.post(
        '/api/dummies/quiz',
        null,
        { params: { id: quizData.quizId, answer: selectedIndex + 1 } }
      );
      if (res.data.isSuccess || res.data.success) {
        showToast(res.data.message || '퀴즈 풀이에 성공했어요!', 'success');
        navigate('/');
      } else {
        showToast(res.data.message || '퀴즈 풀이에 실패했어요.', 'error');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.code as string | undefined;
        const msg =
          err.response?.data?.message || '정답 제출 중 오류가 발생했어요.';

        if (code === 'DUMMY4006' || code === 'DUMMY4007') {
          // 이미 제출했거나 티켓 소진 → 홈으로
          showToast(msg, code === 'DUMMY4007' ? 'info' : 'error');
          navigate('/');
        } else {
          // DUMMY4005 오답 등 → 페이지에서 재시도 허용
          showToast(msg, 'error');
        }
      } else {
        showToast('알 수 없는 오류가 발생했어요.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIndex, quizData, showToast, navigate]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // ── Loading state ────────────────────────────────────────
  if (isLoading) {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>👻</GhostEmoji>
          <GlitchLabel>{glitchText}</GlitchLabel>
        </Content>
      </PageContainer>
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (error) {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>😵</GhostEmoji>
          <StateTitle>신호가 끊겼어요</StateTitle>
          <StateSubtitle>{error}</StateSubtitle>
          <div style={{ display: 'flex', gap: 'var(--dt-space-3)', marginTop: 'var(--dt-space-2)' }}>
            <RetryButton onClick={() => navigate(-1)}>뒤로 가기</RetryButton>
            <RetryButton onClick={fetchQuiz} style={{ borderColor: 'var(--dt-accent)', background: 'var(--dt-accent-soft)', color: 'var(--dt-fg-primary)' }}>다시 시도</RetryButton>
          </div>
        </Content>
      </PageContainer>
    );
  }

  // ── No quiz (DUMMY4003) ──────────────────────────────────
  if (isNoQuiz) {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>😴</GhostEmoji>
          <StateTitle>아직 퀴즈 신호가 없어요</StateTitle>
          <StateSubtitle>
            유령이 문제를 준비 중이에요.{'\n'}조금만 더 기다려 주세요.
          </StateSubtitle>
          <RetryButton onClick={() => navigate(-1)}>뒤로 가기</RetryButton>
        </Content>
      </PageContainer>
    );
  }

  // ── Fallback empty ───────────────────────────────────────
  if (!quizData) {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>🌀</GhostEmoji>
          <StateTitle>퀴즈 정보를 찾을 수 없어요</StateTitle>
          <StateSubtitle>잠시 후 다시 시도해 주세요.</StateSubtitle>
          <RetryButton onClick={() => navigate(-1)}>뒤로 가기</RetryButton>
        </Content>
      </PageContainer>
    );
  }

  const { status, title, answerList } = quizData;
  const safeAnswerList = Array.isArray(answerList) ? answerList : [];

  // ── NOT_OPEN ─────────────────────────────────────────────
  if (status === 'NOT_OPEN') {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>⏳</GhostEmoji>
          <StateTitle>퀴즈 오픈 대기 중이에요</StateTitle>
          <StateSubtitle>곧 시작해요. 놓치지 마세요!</StateSubtitle>
        </Content>
      </PageContainer>
    );
  }

  // ── CLOSE ────────────────────────────────────────────────
  if (status === 'CLOSE') {
    return (
      <PageContainer>
        <Content>
          <GhostEmoji>🏁</GhostEmoji>
          <StateTitle>퀴즈가 종료되었어요</StateTitle>
          <StateSubtitle>다음 퀴즈를 기대해 주세요.</StateSubtitle>
        </Content>
      </PageContainer>
    );
  }

  // ── OPEN — 메인 퀴즈 UI ──────────────────────────────────
  return (
    <PageContainer>
      <Content>
        <QuizCard>
          <QuizLabel>◈ QUIZ TRANSMISSION</QuizLabel>
          <QuizTitle>{title || '질문이 없습니다.'}</QuizTitle>
          <AnswerList>
            {safeAnswerList.map((answer, index) => (
              <AnswerButton
                key={index}
                $selected={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                disabled={isSubmitting}
              >
                {index + 1}. {answer}
              </AnswerButton>
            ))}
          </AnswerList>
          <SubmitButton
            onClick={handleSubmit}
            disabled={selectedIndex === null || isSubmitting || safeAnswerList.length === 0}
          >
            {isSubmitting ? '전송 중...' : '정답 전송'}
          </SubmitButton>
        </QuizCard>
      </Content>
    </PageContainer>
  );
};

export default QuizPage;
