import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, MyPageDTO } from '../types/api';
import { useToast } from '../components/Toast';
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
  gap: var(--dt-space-6);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
  width: 100%;
  margin-bottom: var(--dt-space-2);
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

const InfoCard = styled.div`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  box-shadow: var(--dt-shadow-md);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--dt-space-4);
  border-bottom: 1px solid var(--dt-stroke-faint);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Label = styled.span`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
`;

const Value = styled.span`
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-primary);
`;

const Badge = styled.span<{ $active: boolean }>`
  padding: var(--dt-space-1) var(--dt-space-3);
  border-radius: var(--dt-radius-pill);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  background: ${({ $active }) => $active ? 'rgba(111, 217, 168, 0.15)' : 'var(--dt-bg-elevated)'};
  color: ${({ $active }) => $active ? 'var(--dt-success)' : 'var(--dt-fg-tertiary)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(111, 217, 168, 0.3)' : 'var(--dt-stroke-soft)'};
`;

const MyPage: React.FC = () => {
  const [userData, setUserData] = useState<MyPageDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchMyPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: AxiosResponse<APIResponse<MyPageDTO[] | MyPageDTO>> = await api.get('/api/members/my-page');
      
      const resData = res.data;
      const isSuccess = resData.isSuccess || (resData as unknown as { success: boolean }).success || resData.code === 'MEMBER2007';

      if (isSuccess && resData.result) {
        // 결과가 배열일 수도, 객체일 수도 있으므로 안전하게 처리
        const resultData = Array.isArray(resData.result) ? resData.result[0] : resData.result;
        setUserData(resultData);
      } else {
        navigate('/error', { state: { code: resData.code, message: resData.message } });
      }
    } catch (err) {
      if (isAxiosError(err)) {
        navigate('/error', { 
          state: { 
            code: err.response?.data?.code || 'FETCH_ERROR', 
            message: err.response?.data?.message || '사용자 정보를 가져오지 못했습니다.' 
          } 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn()) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login');
      return;
    }
    fetchMyPage();
  }, [fetchMyPage, navigate, showToast]);

  if (isLoading) {
    return (
      <>
        <Header isLoggedIn={true} onLogout={() => navigate('/')} />
        <Page>
          <Content>
          <SectionHeader>
            <BackButton onClick={() => navigate('/')}>
              ← 홈으로
            </BackButton>
            <SectionTitle>마이페이지</SectionTitle>
          </SectionHeader>
            <InfoCard>
              <Label>불러오는 중...</Label>
            </InfoCard>
          </Content>
        </Page>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={true} onLogout={() => navigate('/')} />
      <Page>
        <Content>
          <SectionHeader>
            <BackButton onClick={() => navigate('/')}>
              ← 홈으로
            </BackButton>
            <SectionTitle>마이페이지</SectionTitle>
          </SectionHeader>
          <InfoCard>
            <InfoRow>
              <Label>닉네임</Label>
              <Value>{userData?.memberName}</Value>
            </InfoRow>
            <InfoRow>
              <Label>이메일</Label>
              <Value>{userData?.email}</Value>
            </InfoRow>
            <InfoRow>
              <Label>잡지식 뽑기 횟수</Label>
              <Value>{userData?.reqCount}회</Value>
            </InfoRow>
            <InfoRow>
              <Label>구독 상태</Label>
              <Badge $active={!!userData?.isSubscribe}>
                {userData?.isSubscribe ? '구독 중' : '미구독'}
              </Badge>
            </InfoRow>
            {userData?.isSubscribe && (
              <InfoRow>
                <Label>구독 만료일</Label>
                <Value>{userData?.subsExprDate?.split('T')[0]}</Value>
              </InfoRow>
            )}
          </InfoCard>
        </Content>
      </Page>
    </>
  );
};

export default MyPage;
