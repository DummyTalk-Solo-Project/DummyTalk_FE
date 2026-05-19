import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, NoticeDetailDTO } from '../types/api';
import Header from '../components/Header';
import { isLoggedIn } from '../utils/auth';

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

const Content = styled.div`
  width: 100%;
  max-width: var(--dt-content-width);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
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

const Article = styled.article`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  box-shadow: var(--dt-shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
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

const MetaText = styled.span`
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
  font-family: var(--dt-font-mono);
`;

const Divider = styled.div`
  height: 1px;
  background: var(--dt-stroke-faint);
`;

const ArticleTitle = styled.h1`
  font-size: var(--dt-size-xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0;
  line-height: var(--dt-leading-snug);
`;

const ArticleBody = styled.div`
  font-size: var(--dt-size-base);
  color: var(--dt-fg-secondary);
  line-height: var(--dt-leading-relaxed);
  white-space: pre-wrap;
  word-break: break-word;
`;

const UpdatedNote = styled.p`
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-disabled);
  font-family: var(--dt-font-mono);
  margin: 0;
  text-align: right;
`;

const GlitchText = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  letter-spacing: var(--dt-tracking-glitch);
  color: var(--dt-fg-disabled);
  text-align: center;
  margin: var(--dt-space-12) 0;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-12) var(--dt-space-6);
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  animation: dt-float 4s var(--dt-ease-float) infinite;
`;

const ErrorText = styled.p`
  font-size: var(--dt-size-base);
  color: var(--dt-fg-tertiary);
  margin: 0;
  text-align: center;
`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const NoticeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<NoticeDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!id) {
      navigate('/notices');
      return;
    }
    const fetchNotice = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await api.get<APIResponse<NoticeDetailDTO>>(`/api/notices/${id}`);
        if (res.data.result) {
          setNotice(res.data.result);
        } else {
          setFetchError('공지사항을 찾을 수 없습니다.');
        }
      } catch (err) {
        if (isAxiosError(err)) {
          setFetchError(err.response?.data?.message || '공지사항을 불러오지 못했습니다.');
        } else {
          setFetchError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [id, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return <GlitchText>█▒░ LOADING ░▒█</GlitchText>;
    }
    if (fetchError || !notice) {
      return (
        <ErrorState>
          <ErrorIcon>👻</ErrorIcon>
          <ErrorText>{fetchError || '공지사항을 찾을 수 없어요.'}</ErrorText>
        </ErrorState>
      );
    }
    return (
      <Article>
        <ArticleMeta>
          {notice.isPinned && <PinBadge>📌 공지</PinBadge>}
          {notice.authorName && <MetaText>{notice.authorName}</MetaText>}
          <MetaText>{formatDate(notice.createdAt)}</MetaText>
        </ArticleMeta>
        <ArticleTitle>{notice.title}</ArticleTitle>
        <Divider />
        <ArticleBody>{notice.content}</ArticleBody>
        {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
          <UpdatedNote>수정됨: {formatDate(notice.updatedAt)}</UpdatedNote>
        )}
      </Article>
    );
  };

  return (
    <>
      <Header isLoggedIn={loggedIn} onLogout={() => navigate('/')} />
      <Page>
        <Content>
          <SectionHeader>
            <BackButton onClick={() => navigate('/notices')}>
              ← 공지사항
            </BackButton>
          </SectionHeader>
          {renderContent()}
        </Content>
      </Page>
    </>
  );
};

export default NoticeDetailPage;
