import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, NoticeListItemDTO } from '../types/api';
import Header from '../components/Header';
import { isLoggedIn, isAdmin } from '../utils/auth';

const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
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
  align-self: flex-start;

  &:hover {
    background: var(--dt-bg-surface);
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-accent);
    transform: translateX(-2px);
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: var(--dt-content-width);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const PageTitle = styled.h1`
  font-size: var(--dt-size-2xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0 0 var(--dt-space-2);
`;

const PageLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: 0 0 var(--dt-space-4);
`;

const NoticeItem = styled.button`
  width: 100%;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-lg);
  padding: var(--dt-space-5) var(--dt-space-6);
  text-align: left;
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);

  &:hover {
    border-color: var(--dt-stroke-accent);
    background: var(--dt-bg-elevated);
    box-shadow: var(--dt-glow-soft);
    transform: translateY(-1px);
  }
`;

const NoticeItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  flex-wrap: wrap;
`;

const PinBadge = styled.span`
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-warning);
  background: rgba(232, 197, 106, 0.12);
  border: 1px solid rgba(232, 197, 106, 0.25);
  border-radius: var(--dt-radius-pill);
  padding: 2px var(--dt-space-2);
`;

const NoticeTitle = styled.span`
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-primary);
  flex: 1;
  min-width: 0;
`;

const NoticeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
`;

const MetaText = styled.span`
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
  font-family: var(--dt-font-mono);
`;

const LoadMoreButton = styled.button`
  width: 100%;
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-lg);
  padding: var(--dt-space-4);
  color: var(--dt-fg-secondary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  margin-top: var(--dt-space-2);

  &:hover:not(:disabled) {
    border-color: var(--dt-stroke-accent);
    color: var(--dt-fg-primary);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-16) var(--dt-space-6);
  color: var(--dt-fg-tertiary);
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
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-12) var(--dt-space-6);
  color: var(--dt-danger);
`;

const GlitchText = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  letter-spacing: var(--dt-tracking-glitch);
  color: var(--dt-fg-disabled);
  text-align: center;
  margin: var(--dt-space-8) 0;
`;

const PAGE_SIZE = 20;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<NoticeListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [fetchError, setFetchError] = useState('');
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const fetchNotices = useCallback(async (page: number, append: boolean) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setFetchError('');

    try {
      const res = await api.get<APIResponse<NoticeListItemDTO[]>>(
        `/api/notices?page=${page}`
      );
      const data = res.data.result ?? [];
      setNotices(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err) {
      if (isAxiosError(err)) {
        setFetchError(err.response?.data?.message || '공지사항을 불러오지 못했습니다.');
      } else {
        setFetchError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin', { replace: true });
      return;
    }
    fetchNotices(0, false);
  }, [fetchNotices, navigate]);

  const handleLoadMore = () => {
    fetchNotices(currentPage + 1, true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <GlitchText>█▒░ LOADING NOTICES ░▒█</GlitchText>;
    }
    if (fetchError) {
      return (
        <ErrorState>
          <EmptyIcon>😵</EmptyIcon>
          <EmptyText>{fetchError}</EmptyText>
        </ErrorState>
      );
    }
    if (notices.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>👻</EmptyIcon>
          <EmptyText>아직 아무 소식도 없어요.<br />유령도 조용히 기다리는 중...</EmptyText>
        </EmptyState>
      );
    }
    return (
      <>
        {notices.map((notice) => (
          <NoticeItem
            key={notice.id}
            onClick={() => navigate(`/notices/${notice.id}`)}
          >
            <NoticeItemHeader>
              {notice.isPinned && <PinBadge>📌 공지</PinBadge>}
              <NoticeTitle>{notice.title}</NoticeTitle>
            </NoticeItemHeader>
            <NoticeMeta>
              {notice.authorName && (
                <MetaText>{notice.authorName}</MetaText>
              )}
              <MetaText>{formatDate(notice.createdAt)}</MetaText>
            </NoticeMeta>
          </NoticeItem>
        ))}
        {hasMore && (
          <LoadMoreButton onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? '불러오는 중...' : '더 보기'}
          </LoadMoreButton>
        )}
      </>
    );
  };

  return (
    <>
      <Header isLoggedIn={loggedIn} onLogout={() => navigate('/')} />
      <Page>
        <Content>
          <BackButton onClick={() => navigate('/')}>← 홈으로</BackButton>
          <PageLabel>◈ BROADCAST</PageLabel>
          <PageTitle>공지사항</PageTitle>
          {renderContent()}
        </Content>
      </Page>
    </>
  );
};

export default NoticePage;
