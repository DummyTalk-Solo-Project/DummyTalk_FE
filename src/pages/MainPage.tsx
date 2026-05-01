import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, DummyResponseDTO, RarityName } from '../types/api';
import { isLoggedIn, getUsername } from '../utils/auth';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import TypingText from '../components/TypingText';
import IntroModal from '../components/IntroModal';

// ── Animations ───────────────────────────────────────────────
const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: var(--dt-glow-soft); }
  50%       { box-shadow: var(--dt-glow-bloom); }
`;

// ── Layout ───────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--dt-bg-base);
  display: flex;
  flex-direction: column;
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
  gap: var(--dt-space-8);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

// ── Greeting ─────────────────────────────────────────────────
const Greeting = styled.div`
  text-align: center;
`;

const GreetingName = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: 0 0 var(--dt-space-2);
`;

const GreetingTitle = styled.h1`
  font-size: var(--dt-size-2xl);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-tight);
  color: var(--dt-fg-primary);
  margin: 0;
`;

// ── Knowledge Card ───────────────────────────────────────────
const RARITY_COLORS: Record<string, string> = {
  COMMON:  'var(--dt-rarity-common)',
  RARE:    'var(--dt-rarity-rare)',
  EPIC:    'var(--dt-rarity-epic)',
  SPECIAL: 'var(--dt-rarity-special)',
};

const RARITY_LABELS: Record<string, string> = {
  COMMON:  'COMMON',
  RARE:    'RARE',
  EPIC:    'EPIC',
  SPECIAL: 'SPECIAL',
};

const KnowledgeCard = styled.div<{ $rarity?: RarityName; $loading?: boolean }>`
  width: 100%;
  background: var(--dt-bg-surface);
  border: 1px solid ${({ $rarity }) =>
    $rarity ? 'transparent' : 'var(--dt-stroke-soft)'};
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  box-shadow: ${({ $loading }) =>
    $loading ? 'none' : 'var(--dt-shadow-md), var(--dt-inset-highlight)'};
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  ${({ $rarity }) =>
    $rarity &&
    css`
      outline: 1px solid ${RARITY_COLORS[$rarity]};
      box-shadow: 0 0 32px ${RARITY_COLORS[$rarity]}22, var(--dt-shadow-md);
    `}

  ${({ $loading }) =>
    $loading &&
    css`
      animation: ${pulseGlow} 1.5s ease infinite;
    `}
`;

const RarityBadge = styled.span<{ $rarity: RarityName }>`
  display: inline-block;
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: ${({ $rarity }) => RARITY_COLORS[$rarity]};
  align-self: flex-start;
`;

const KnowledgeTitle = styled.h2`
  font-size: var(--dt-size-lg);
  font-weight: var(--dt-weight-semibold);
  line-height: var(--dt-leading-snug);
  letter-spacing: var(--dt-tracking-tight);
  color: var(--dt-fg-primary);
  margin: 0;
`;

const LoadingPlaceholder = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: var(--dt-space-4) 0;
  text-align: center;
`;

// ── Buttons ──────────────────────────────────────────────────
const ButtonRow = styled.div`
  display: flex;
  gap: var(--dt-space-4);
  width: 100%;
`;

const PrimaryButton = styled.button`
  flex: 1;
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4) var(--dt-space-5);

  color: var(--dt-fg-on-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
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
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: var(--dt-bg-elevated);
  color: var(--dt-fg-primary);
  border: 1px solid var(--dt-stroke-soft);

  &:hover:not(:disabled) {
    background: var(--dt-bg-elevated);
    border-color: var(--dt-stroke-accent);
    box-shadow: var(--dt-glow-soft);
    transform: translateY(-1px);
  }
`;

// ── Glitch strings for loading ───────────────────────────────
const GLITCH_STRINGS = [
  '▓▒░ FETCHING KNOWLEDGE ░▒▓',
  'データ転送中...',
  '◈ SIGNAL INCOMING ◈',
  '존재 탐색 중...',
];

// ── Component ────────────────────────────────────────────────
const MainPage: React.FC = () => {
  const username = getUsername();

  const [dummy, setDummy] = useState<DummyResponseDTO | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [glitchIdx, setGlitchIdx] = useState(0);
  const [logged, setLogged] = useState(isLoggedIn());
  const [showModal, setShowModal] = useState(!isLoggedIn());

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 글리치 텍스트 사이클링 (로딩 중에만)
  useEffect(() => {
    if (!isFetching) return;
    const id = setInterval(
      () => setGlitchIdx((i) => (i + 1) % GLITCH_STRINGS.length),
      500
    );
    return () => clearInterval(id);
  }, [isFetching]);

  useEffect(() => {
    setShowModal(!logged);
  }, [logged]);

  const handleLogoutSuccess = useCallback(() => {
    setLogged(false);
  }, []);

  const fetchDummy = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    setDrawError(null);
    try {
      const res: AxiosResponse<APIResponse<DummyResponseDTO>> =
        await api.get('/api/dummies/dummy');
      if (res.data.isSuccess || res.data.success) {
        setDummy(res.data.result);
      } else {
        setDrawError(res.data.message || '잡지식을 불러오지 못했어요.');
        showToast(res.data.message || '잡지식을 불러오지 못했어요.', 'error');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message || '잡지식을 불러오지 못했어요.';
        setDrawError(msg);
        showToast(msg, 'error');
      }
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, showToast]);

  const cardContent = () => {
    if (isFetching) {
      return (
        <KnowledgeCard $loading>
          <LoadingPlaceholder>{GLITCH_STRINGS[glitchIdx]}</LoadingPlaceholder>
        </KnowledgeCard>
      );
    }
    if (drawError) {
      return (
        <KnowledgeCard>
          <LoadingPlaceholder style={{ color: 'var(--dt-danger)' }}>◈ 통신 오류 발생</LoadingPlaceholder>
          <KnowledgeTitle style={{ textAlign: 'center', fontSize: 'var(--dt-size-base)' }}>{drawError}</KnowledgeTitle>
          <div style={{ display: 'flex', gap: 'var(--dt-space-2)', marginTop: 'var(--dt-space-4)' }}>
            <SecondaryButton onClick={() => setDrawError(null)} style={{ flex: 1 }}>뒤로 가기</SecondaryButton>
            <PrimaryButton onClick={fetchDummy} style={{ flex: 1 }}>다시 시도</PrimaryButton>
          </div>
        </KnowledgeCard>
      );
    }
    if (dummy) {
      const rarity = dummy.rarityName || 'COMMON';
      return (
        <KnowledgeCard $rarity={rarity as RarityName}>
          <RarityBadge $rarity={rarity as RarityName}>
            ◈ {RARITY_LABELS[rarity] || rarity}
          </RarityBadge>
          <KnowledgeTitle>{dummy.title || '제목 없음'}</KnowledgeTitle>
          <TypingText text={dummy.content || ''} speed={30} />
        </KnowledgeCard>
      );
    }
    return (
      <KnowledgeCard>
        <LoadingPlaceholder>◈ 버튼을 눌러 잡지식을 뽑아보세요</LoadingPlaceholder>
      </KnowledgeCard>
    );
  };

  return (
    <>
      {showModal && (
        <IntroModal
          onClose={() => setShowModal(false)}
          imageSrc="/favicon.jpg"
        />
      )}
      <Header isLoggedIn={logged} onLogout={handleLogoutSuccess} />
      <Page>
        <Content>
          <Greeting>
            <GreetingName>
              {username ? `◈ ${username}` : '◈ GHOST NETWORK'}
            </GreetingName>
            <GreetingTitle>
              {username ? `안녕하세요, ${username}님` : '안녕하세요, 처음 뵙겠습니다'}
            </GreetingTitle>
          </Greeting>

          {cardContent()}

          <ButtonRow>
            <PrimaryButton onClick={fetchDummy} disabled={isFetching}>
              {isFetching ? '수신 중...' : '✦ 잡지식 뽑기'}
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate('/quiz')}>
              ◈ 퀴즈 도전
            </SecondaryButton>
          </ButtonRow>
        </Content>
      </Page>
    </>
  );
};

export default MainPage;
