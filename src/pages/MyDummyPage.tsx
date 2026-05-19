import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, MyDummyItemDTO, RarityName } from '../types/api';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import { isLoggedIn } from '../utils/auth';

const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spinSlow = keyframes`
  to { transform: rotate(360deg); }
`;

// ── Helpers (defined before styled components that interpolate them) ──

const hexToRgba = (hex: string, alpha: number): string => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return `rgba(120,120,120,${alpha})`;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const RARITY_HEX: Record<RarityName, string> = {
  COMMON:  '#7C7891',
  RARE:    '#6FA8D9',
  EPIC:    '#B194FF',
  SPECIAL: '#E8C56A',
};

const getRarityColor = (item: MyDummyItemDTO): string =>
  item.colorCode || RARITY_HEX[item.name] || '#7C7891';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

// ── Layout ───────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--dt-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px var(--dt-space-6) var(--dt-space-10);
  box-sizing: border-box;
`;

const Content = styled.div`
  width: 100%;
  max-width: var(--dt-content-width);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
`;

const BackButton = styled.button`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-2) var(--dt-space-3);
  color: var(--dt-fg-secondary);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  flex-shrink: 0;

  &:hover {
    background: var(--dt-bg-surface);
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-accent);
    transform: translateX(-2px);
  }
`;

const PageTitle = styled.h1`
  font-size: var(--dt-size-xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0;
`;

// ── Search ───────────────────────────────────────────────────

const SearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-10) var(--dt-space-3) var(--dt-space-4);
  box-sizing: border-box;
  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
  outline: none;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap);

  &::placeholder { color: var(--dt-fg-disabled); }
  &:focus {
    border-color: var(--dt-stroke-accent);
    box-shadow: 0 0 0 3px rgba(154, 123, 240, 0.12);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: var(--dt-space-3);
  background: none;
  border: none;
  color: var(--dt-fg-disabled);
  cursor: pointer;
  font-size: var(--dt-size-base);
  padding: var(--dt-space-1);
  line-height: 1;
  transition: color var(--dt-dur-quick) var(--dt-ease-snap);

  &:hover { color: var(--dt-fg-primary); }
`;

const SearchHint = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-lavender-300);
  margin: 0;
  letter-spacing: var(--dt-tracking-glitch);
`;

// ── Dummy Card ────────────────────────────────────────────────
// DummyContent must be declared BEFORE DummyCard so styled-components
// can resolve the selector reference used in DummyCard's hover rule.

const DummyContent = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-secondary);
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  max-height: 3.2em;
  transition: max-height 0.5s var(--dt-ease-float);
`;

const DummyCard = styled.div<{ $color: string }>`
  background: linear-gradient(
    135deg,
    ${({ $color }) => hexToRgba($color, 0.12)} 0%,
    var(--dt-bg-surface) 55%
  );
  border: 1px solid var(--dt-stroke-soft);
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: var(--dt-radius-lg);
  padding: var(--dt-space-4) var(--dt-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  cursor: default;
  transition:
    box-shadow var(--dt-dur-base) var(--dt-ease-snap),
    border-color var(--dt-dur-base) var(--dt-ease-snap),
    background var(--dt-dur-base) var(--dt-ease-snap),
    transform var(--dt-dur-base) var(--dt-ease-snap);
  animation: ${fadeRise} var(--dt-dur-soft) var(--dt-ease-rise) both;

  &:hover {
    background: linear-gradient(
      135deg,
      ${({ $color }) => hexToRgba($color, 0.22)} 0%,
      var(--dt-bg-elevated) 55%
    );
    border-color: ${({ $color }) => hexToRgba($color, 0.4)};
    box-shadow: var(--dt-shadow-md), 0 0 22px ${({ $color }) => hexToRgba($color, 0.3)};
    transform: translateY(-2px);
  }

  &:hover ${DummyContent} {
    max-height: 400px;
  }
`;

const DummyCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
`;

const RarityBadge = styled.span<{ $color: string }>`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-wide);
  color: ${({ $color }) => $color};
  background: ${({ $color }) => hexToRgba($color, 0.15)};
  border: 1px solid ${({ $color }) => hexToRgba($color, 0.35)};
  border-radius: var(--dt-radius-pill);
  padding: 2px var(--dt-space-2);
  flex-shrink: 0;
`;

const DummyTitle = styled.span`
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-fg-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DummyDate = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-disabled);
  align-self: flex-end;
`;

// ── States ───────────────────────────────────────────────────

const GlitchText = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  letter-spacing: var(--dt-tracking-glitch);
  color: var(--dt-fg-disabled);
  text-align: center;
  margin: var(--dt-space-10) 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-16) var(--dt-space-6);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  animation: dt-float 4s var(--dt-ease-float) infinite;
`;

const EmptyText = styled.p`
  font-size: var(--dt-size-base);
  color: var(--dt-fg-tertiary);
  margin: 0;
  text-align: center;
  line-height: var(--dt-leading-relaxed);
  white-space: pre-line;
`;

const LoadingMoreRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4) 0;
  color: var(--dt-fg-tertiary);
  font-size: var(--dt-size-sm);
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid var(--dt-stroke-soft);
  border-top-color: var(--dt-accent);
  border-radius: 50%;
  animation: ${spinSlow} 0.8s linear infinite;
  display: inline-block;
`;

const Sentinel = styled.div`
  height: 1px;
  width: 100%;
`;

const CountLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-disabled);
  margin: 0;
  text-align: right;
`;

// ── Component ────────────────────────────────────────────────

const MyDummyPage: React.FC = () => {
  const [items, setItems] = useState<MyDummyItemDTO[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [fetchError, setFetchError] = useState('');

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchItems = useCallback(async (
    keyword: string,
    page: number,
    append: boolean
  ) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setFetchError('');

    try {
      const url = keyword
        ? `/api/dummies/my-dummy/keyword?keyword=${encodeURIComponent(keyword)}&page=${page}`
        : `/api/dummies/my-dummy?page=${page}`;

      const res = await api.get<APIResponse<MyDummyItemDTO[]>>(url);
      const data = res.data.result ?? [];
      setItems(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length > 0);
      setCurrentPage(page);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message || '더미 목록을 불러오지 못했습니다.';
        setFetchError(msg);
        if (!append) showToast(msg, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoggedIn()) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login');
      return;
    }
    fetchItems('', 0, false);
  }, [fetchItems, navigate, showToast]);

  // 0.3s debounce search — skip first mount to avoid double-fetch
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const kw = searchInput.trim();
      setActiveKeyword(kw);
      fetchItems(kw, 0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, fetchItems]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchItems(activeKeyword, currentPage + 1, true);
        }
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, activeKeyword, currentPage, fetchItems]);

  const renderList = () => {
    if (isLoading) {
      return <GlitchText>█▒░ SYNCING ARCHIVE ░▒█</GlitchText>;
    }
    if (fetchError) {
      return (
        <EmptyState>
          <EmptyIcon>😵</EmptyIcon>
          <EmptyText>{fetchError}</EmptyText>
        </EmptyState>
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>👻</EmptyIcon>
          <EmptyText>
            {activeKeyword
              ? `"${activeKeyword}"에 해당하는 잡지식이 없어요.\n더 넓게 검색해볼까요?`
              : '아직 뽑은 잡지식이 없어요.\n오늘의 첫 번째 지식을 불러보세요!'}
          </EmptyText>
        </EmptyState>
      );
    }

    return (
      <>
        <CountLabel>
          {items.length.toLocaleString()}개{hasMore ? ' (더 있음)' : ''}
        </CountLabel>

        {items.map((item) => {
          const color = getRarityColor(item);
          return (
            <DummyCard key={item.dummyId} $color={color}>
              <DummyCardHeader>
                <RarityBadge $color={color}>{item.name}</RarityBadge>
                <DummyTitle title={item.title}>{item.title}</DummyTitle>
              </DummyCardHeader>
              <DummyContent>{item.content}</DummyContent>
              <DummyDate>{formatDate(item.createdAt)}</DummyDate>
            </DummyCard>
          );
        })}

        {hasMore && <Sentinel ref={sentinelRef} />}

        {isLoadingMore && (
          <LoadingMoreRow>
            <Spinner />
            <span>불러오는 중...</span>
          </LoadingMoreRow>
        )}
      </>
    );
  };

  return (
    <>
      <Header isLoggedIn={true} onLogout={() => navigate('/')} />
      <Page>
        <Content>
          <SectionHeader>
            <BackButton onClick={() => navigate('/')}>← 홈으로</BackButton>
            <PageTitle>잡지식 보관함</PageTitle>
          </SectionHeader>

          <SearchWrap>
            <SearchInput
              type="text"
              placeholder="잡지식 검색 (한글 형태소 분석 지원)"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <ClearButton
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="검색어 지우기"
              >
                ×
              </ClearButton>
            )}
          </SearchWrap>

          {activeKeyword && (
            <SearchHint>◈ "{activeKeyword}" 검색 중</SearchHint>
          )}

          {renderList()}
        </Content>
      </Page>
    </>
  );
};

export default MyDummyPage;
