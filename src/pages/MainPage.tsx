import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, DummyResponseDTO, RarityName } from '../types/api';
import { isLoggedIn, getUsername, isAdmin } from '../utils/auth';
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

const hexToRgba = (hex: string, alpha: number): string => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return `rgba(120,120,120,${alpha})`;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// CSS variable refs — used for text color only (valid as color values)
const RARITY_COLORS: Record<string, string> = {
  COMMON:  'var(--dt-rarity-common)',
  RARE:    'var(--dt-rarity-rare)',
  EPIC:    'var(--dt-rarity-epic)',
  SPECIAL: 'var(--dt-rarity-special)',
};

// Hex values — used for rgba() tint calculations
const RARITY_HEX: Record<string, string> = {
  COMMON:  '#F4F0E4',
  RARE:    '#44A194',
  EPIC:    '#DE99FF',
  SPECIAL: '#EC8F8D',
};

// Per-rarity tint intensity for KnowledgeCard
const RARITY_CARD_TINT: Record<string, { bg: number; border: number; glow: number }> = {
  COMMON:  { bg: 0.05, border: 0.22, glow: 0.12 },
  RARE:    { bg: 0.10, border: 0.32, glow: 0.22 },
  EPIC:    { bg: 0.18, border: 0.48, glow: 0.38 },
  SPECIAL: { bg: 0.12, border: 0.38, glow: 0.28 },
};

const RARITY_LABELS: Record<string, string> = {
  COMMON:  'COMMON',
  RARE:    'RARE',
  EPIC:    'EPIC',
  SPECIAL: 'SPECIAL',
};

const KnowledgeCard = styled.div<{
  $rarity?: RarityName;
  $loading?: boolean;
  $hexColor?: string;
  $bgAlpha?: number;
  $borderAlpha?: number;
  $glowAlpha?: number;
}>`
  width: 100%;
  background: ${({ $hexColor, $bgAlpha }) =>
    $hexColor
      ? `linear-gradient(135deg, ${hexToRgba($hexColor, $bgAlpha ?? 0.10)} 0%, var(--dt-bg-surface) 55%)`
      : 'var(--dt-bg-surface)'};
  border: 1px solid ${({ $hexColor, $borderAlpha }) =>
    $hexColor
      ? hexToRgba($hexColor, $borderAlpha ?? 0.30)
      : 'var(--dt-stroke-soft)'};
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  box-shadow: ${({ $loading, $hexColor, $glowAlpha }) =>
    $loading
      ? 'none'
      : $hexColor
        ? `var(--dt-shadow-md), 0 0 32px ${hexToRgba($hexColor, $glowAlpha ?? 0.22)}, var(--dt-inset-highlight)`
        : 'var(--dt-shadow-md), var(--dt-inset-highlight)'};
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

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

// ── Pity Event Banner ────────────────────────────────────────
const pityPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`;

const PityBanner = styled.div<{ $rarity: RarityName }>`
  width: 100%;
  padding: var(--dt-space-3) var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: ${({ $rarity }) => hexToRgba(RARITY_HEX[$rarity] ?? '#7C7891', 0.12)};
  border: 1px solid ${({ $rarity }) => hexToRgba(RARITY_HEX[$rarity] ?? '#7C7891', 0.40)};
  color: ${({ $rarity }) => RARITY_COLORS[$rarity]};
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-glitch);
  text-align: center;
  animation: ${pityPulse} 2s ease-in-out infinite;
`;

const RemainingCount = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
  text-align: center;
  margin: 0;
  letter-spacing: var(--dt-tracking-glitch);
`;

// isNextPityTriggered: 다음 뽑기에서 천장 확정 → 다음 등급 예고
const NEXT_PITY_MESSAGES: Partial<Record<RarityName, string>> = {
  COMMON:  '다음은 무조건 RARE 더미가 나와요!',
  RARE:    '다음은 무조건 EPIC 더미가 나와요!',
  EPIC:    '다음은 무조건 SPECIAL 더미가 나와요!',
};

const NEXT_RARITY: Record<RarityName, RarityName | null> = {
  COMMON:  'RARE',
  RARE:    'EPIC',
  EPIC:    'SPECIAL',
  SPECIAL: null,
};

// isPityTriggered: 이번 뽑기가 천장 발동 → 카드 상단에 천장 발동 배지 표시
const PityTriggeredBadge = styled.span<{ $rarity: RarityName }>`
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-1);
  padding: 2px var(--dt-space-2);
  border-radius: var(--dt-radius-pill);
  background: ${({ $rarity }) => hexToRgba(RARITY_HEX[$rarity] ?? '#7C7891', 0.15)};
  border: 1px solid ${({ $rarity }) => hexToRgba(RARITY_HEX[$rarity] ?? '#7C7891', 0.45)};
  color: ${({ $rarity }) => RARITY_COLORS[$rarity]};
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-glitch);
  align-self: flex-start;
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

  useEffect(() => {
    if (isAdmin()) navigate('/admin', { replace: true });
  }, [navigate]);

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
      const rarity = (dummy.rarityName || 'COMMON').toUpperCase() as RarityName;
      const nextRarity = NEXT_RARITY[rarity];
      const tint = RARITY_CARD_TINT[rarity] ?? RARITY_CARD_TINT.COMMON;
      return (
        <KnowledgeCard
          $rarity={rarity}
          $hexColor={RARITY_HEX[rarity] ?? RARITY_HEX.COMMON}
          $bgAlpha={tint.bg}
          $borderAlpha={tint.border}
          $glowAlpha={tint.glow}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dt-space-2)', flexWrap: 'wrap' }}>
            <RarityBadge $rarity={rarity as RarityName}>
              ◈ {RARITY_LABELS[rarity] || rarity}
            </RarityBadge>
            {dummy.isPityTriggered && (
              <PityTriggeredBadge $rarity={rarity as RarityName}>
                ✦ 천장 발동
              </PityTriggeredBadge>
            )}
          </div>
          <KnowledgeTitle>{dummy.title || '제목 없음'}</KnowledgeTitle>
          <TypingText text={dummy.content || ''} speed={30} />
          {dummy.isNextPityTriggered && nextRarity && NEXT_PITY_MESSAGES[rarity as RarityName] && (
            <PityBanner $rarity={nextRarity}>
              ✦ {NEXT_PITY_MESSAGES[rarity as RarityName]}
            </PityBanner>
          )}
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
          {dummy?.remainingCount != null && (
            <RemainingCount>
              ◈ 오늘 남은 횟수 : {dummy.remainingCount}회
            </RemainingCount>
          )}
        </Content>
      </Page>
    </>
  );
};

export default MainPage;
