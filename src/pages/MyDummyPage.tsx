import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, MyDummyItemDTO } from '../types/api';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import { isLoggedIn } from '../utils/auth';

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
  gap: var(--dt-space-6);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
  width: 100%;
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

const SectionTitle = styled.h2`
  font-size: var(--dt-size-xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  gap: var(--dt-space-3);
  width: 100%;
`;

const SearchInput = styled.input`
  flex: 1;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);
  color: var(--dt-fg-primary);
  font-size: var(--dt-size-base);
  font-family: var(--dt-font-sans);
  outline: none;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap);

  &::placeholder { color: var(--dt-fg-disabled); }
  &:focus { border-color: var(--dt-stroke-accent); }
`;

const SearchButton = styled.button`
  background: var(--dt-accent-soft);
  border: 1px solid var(--dt-stroke-accent);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-5);
  color: var(--dt-fg-primary);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover { background: var(--dt-lavender-700); }
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);
  color: var(--dt-fg-tertiary);
  font-size: var(--dt-size-sm);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    border-color: var(--dt-stroke-strong);
    color: var(--dt-fg-secondary);
  }
`;

const getRarityVar = (rarity: string) => {
  switch (rarity.toUpperCase()) {
    case 'COMMON':  return 'var(--dt-rarity-common)';
    case 'RARE':    return 'var(--dt-rarity-rare)';
    case 'EPIC':    return 'var(--dt-rarity-epic)';
    case 'SPECIAL': return 'var(--dt-rarity-special)';
    default:        return 'var(--dt-fg-tertiary)';
  }
};

const DummyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
`;

const DummyCard = styled.div<{ $rarity: string }>`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-left: 3px solid ${({ $rarity }) => getRarityVar($rarity)};
  border-radius: var(--dt-radius-lg);
  padding: var(--dt-space-5) var(--dt-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap),
              background var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    background: var(--dt-bg-elevated);
    border-color: var(--dt-stroke-strong);
    border-left-color: ${({ $rarity }) => getRarityVar($rarity)};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--dt-space-3);
`;

const CardTitle = styled.h3`
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-fg-primary);
  margin: 0;
  flex: 1;
  line-height: var(--dt-leading-snug);
`;

const RarityBadge = styled.span<{ $rarity: string }>`
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  color: ${({ $rarity }) => getRarityVar($rarity)};
  background: ${({ $rarity }) => getRarityVar($rarity)}22;
  border: 1px solid ${({ $rarity }) => getRarityVar($rarity)}44;
  border-radius: var(--dt-radius-pill);
  padding: 2px var(--dt-space-2);
  flex-shrink: 0;
  letter-spacing: var(--dt-tracking-wide);
`;

const CardContent = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-secondary);
  margin: 0;
  line-height: var(--dt-leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDate = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-disabled);
  margin-top: var(--dt-space-1);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--dt-space-4);
  margin-top: var(--dt-space-2);
`;

const PageButton = styled.button`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-2) var(--dt-space-4);
  color: var(--dt-fg-secondary);
  font-size: var(--dt-size-sm);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:disabled {
    background: transparent;
    border-color: var(--dt-stroke-faint);
    color: var(--dt-fg-disabled);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--dt-bg-surface);
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-accent);
  }
`;

const PageInfo = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  min-width: 60px;
  text-align: center;
`;

const GlitchLoader = styled.div`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  letter-spacing: var(--dt-tracking-glitch);
  animation: ${glitchShake} 0.25s ease infinite;
  text-align: center;
  padding: var(--dt-space-16) 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-16) 0;
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const GhostIcon = styled.div`
  font-size: 48px;
  line-height: 1;
`;

const EmptyMessage = styled.p`
  font-size: var(--dt-size-base);
  color: var(--dt-fg-tertiary);
  text-align: center;
  margin: 0;
`;

const EmptyHint = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-disabled);
  text-align: center;
  margin: 0;
`;

const GLITCH_CHARS = ['✦', '⣿', '▒', '░', '╳', '⬡', '◈', '⊗', '⊞', '⊠', '∅', '⌬', '⌘'];
const randomGlitch = () =>
  Array.from({ length: 18 }, () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]).join('');

const MyDummyPage: React.FC = () => {
  const [items, setItems] = useState<MyDummyItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [glitchText, setGlitchText] = useState(randomGlitch());
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDummies = useCallback(async (p: number, kw: string) => {
    setIsLoading(true);
    const interval = setInterval(() => setGlitchText(randomGlitch()), 120);
    try {
      const endpoint = kw
        ? `/api/dummies/my-dummy/keyword?keyword=${encodeURIComponent(kw)}&page=${p}`
        : `/api/dummies/my-dummy?page=${p}`;

      const res = await api.get<APIResponse<MyDummyItemDTO[]>>(endpoint);
      const resData = res.data;
      const isSuccess = resData.isSuccess || resData.code === 'DUMMY2000';

      if (isSuccess && resData.result && resData.result.length > 0) {
        setItems(resData.result);
        setHasMore(true);
      } else {
        setItems([]);
        setHasMore(false);
        if (p > 0) setPage(prev => prev - 1);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        showToast(err.response?.data?.message || '목록을 불러오지 못했습니다.', 'error');
      }
      setItems([]);
      setHasMore(false);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoggedIn()) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login');
      return;
    }
    fetchDummies(page, activeKeyword);
  }, [page, activeKeyword, fetchDummies, navigate, showToast]);

  const handleSearch = () => {
    setPage(0);
    setActiveKeyword(keyword.trim());
  };

  const handleClear = () => {
    setKeyword('');
    setPage(0);
    setActiveKeyword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const formatDate = (iso: string) => iso.split('T')[0].replace(/-/g, '.');

  return (
    <>
      <Header isLoggedIn={true} onLogout={() => navigate('/')} />
      <Page>
        <Content>
          <SectionHeader>
            <BackButton onClick={() => navigate('/my-page')}>← 마이페이지</BackButton>
            <SectionTitle>내 잡지식 보관함</SectionTitle>
          </SectionHeader>

          <SearchBar>
            <SearchInput
              type="text"
              placeholder="키워드로 잡지식 검색..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <SearchButton onClick={handleSearch}>검색</SearchButton>
            {activeKeyword && <ClearButton onClick={handleClear}>초기화</ClearButton>}
          </SearchBar>

          {isLoading ? (
            <GlitchLoader>{glitchText}</GlitchLoader>
          ) : items.length === 0 ? (
            <EmptyState>
              <GhostIcon>👻</GhostIcon>
              <EmptyMessage>
                {activeKeyword ? `"${activeKeyword}"에 대한 지식이 없어요` : '아직 수집한 잡지식이 없어요'}
              </EmptyMessage>
              <EmptyHint>
                {activeKeyword ? '다른 키워드로 검색해보세요' : '홈으로 돌아가 잡지식을 뽑아보세요!'}
              </EmptyHint>
            </EmptyState>
          ) : (
            <>
              <DummyList>
                {items.map((item, idx) => (
                  <DummyCard
                    key={item.dummyId}
                    $rarity={item.name}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <RarityBadge $rarity={item.name}>{item.name}</RarityBadge>
                    </CardHeader>
                    <CardContent>{item.content}</CardContent>
                    <CardDate>{formatDate(item.createdAt)}</CardDate>
                  </DummyCard>
                ))}
              </DummyList>

              <Pagination>
                <PageButton disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ← 이전
                </PageButton>
                <PageInfo>{page + 1} 페이지</PageInfo>
                <PageButton disabled={!hasMore} onClick={() => setPage(p => p + 1)}>
                  다음 →
                </PageButton>
              </Pagination>
            </>
          )}
        </Content>
      </Page>
    </>
  );
};

export default MyDummyPage;
