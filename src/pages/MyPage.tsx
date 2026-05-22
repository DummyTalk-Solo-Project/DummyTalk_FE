import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { APIResponse, MyPageDTO } from '../types/api';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import { isLoggedIn, removeAccessToken, isAdmin } from '../utils/auth';

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
  align-self: center;
  margin-top: var(--dt-space-4);
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    background: var(--dt-bg-surface);
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-accent);
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

const StackRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--dt-space-3);
`;

const StackLabel = styled.span`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  flex-shrink: 0;
`;

const StackBarWrap = styled.div`
  flex: 1;
  height: 6px;
  background: var(--dt-bg-elevated);
  border-radius: 99px;
  overflow: hidden;
`;

const StackBar = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 99px;
  transition: width 0.4s ease;
`;

const StackValue = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-secondary);
  min-width: 32px;
  text-align: right;
`;

const STACK_COLORS: Record<string, string> = {
  common: 'var(--dt-rarity-common)',
  rare:   'var(--dt-rarity-rare)',
  epic:   'var(--dt-rarity-epic)',
};

const Badge = styled.span<{ $active: boolean }>`
  padding: var(--dt-space-1) var(--dt-space-3);
  border-radius: var(--dt-radius-pill);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  background: ${({ $active }) => $active ? 'rgba(111, 217, 168, 0.15)' : 'var(--dt-bg-elevated)'};
  color: ${({ $active }) => $active ? 'var(--dt-success)' : 'var(--dt-fg-tertiary)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(111, 217, 168, 0.3)' : 'var(--dt-stroke-soft)'};
`;

const ActionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding-top: var(--dt-space-2);
`;

const ActionButton = styled.button<{ $variant?: 'accent' | 'danger' | 'secondary' }>`
  width: 100%;
  padding: var(--dt-space-3) var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  text-align: left;

  ${({ $variant }) => {
    if ($variant === 'accent') return `
      background: var(--dt-accent-soft);
      border: 1px solid var(--dt-stroke-accent);
      color: var(--dt-fg-primary);
      &:hover { background: var(--dt-lavender-700); }
    `;
    if ($variant === 'danger') return `
      background: rgba(224, 122, 142, 0.08);
      border: 1px solid rgba(224, 122, 142, 0.25);
      color: var(--dt-danger);
      &:hover { background: rgba(224, 122, 142, 0.15); border-color: var(--dt-danger); }
    `;
    return `
      background: var(--dt-bg-elevated);
      border: 1px solid var(--dt-stroke-soft);
      color: var(--dt-fg-secondary);
      &:hover { background: var(--dt-bg-surface); color: var(--dt-fg-primary); border-color: var(--dt-stroke-strong); }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmBox = styled.div`
  background: rgba(224, 122, 142, 0.08);
  border: 1px solid rgba(224, 122, 142, 0.25);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
`;

const ConfirmMessage = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-danger);
  margin: 0;
  line-height: var(--dt-leading-relaxed);
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: var(--dt-space-3);
`;

const ConfirmBtn = styled.button<{ $confirm?: boolean }>`
  flex: 1;
  padding: var(--dt-space-2) var(--dt-space-3);
  border-radius: var(--dt-radius-sm);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  ${({ $confirm }) => $confirm ? `
    background: var(--dt-danger);
    border: 1px solid var(--dt-danger);
    color: var(--dt-fg-on-accent);
    &:hover { opacity: 0.85; }
  ` : `
    background: transparent;
    border: 1px solid var(--dt-stroke-soft);
    color: var(--dt-fg-tertiary);
    &:hover { border-color: var(--dt-stroke-strong); color: var(--dt-fg-secondary); }
  `}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const MyPage: React.FC = () => {
  const [userData, setUserData] = useState<MyPageDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [isSubscribeLoading, setIsSubscribeLoading] = useState(false); // 구독 기능 비활성화 중
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
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

  // 구독 기능 비활성화 중 — 재활성화 시 아래 주석 해제 + isSubscribeLoading state 주석 해제
  // const handleSubscribe = async () => {
  //   setIsSubscribeLoading(true);
  //   try {
  //     const res = await api.post<APIResponse<boolean>>('/api/members/subscribe');
  //     const resData = res.data;
  //     const isSuccess = resData.isSuccess || resData.code === 'MEMBER2008';
  //     if (isSuccess) {
  //       showToast(resData.message || '구독 요청에 성공했습니다.', 'success');
  //       fetchMyPage();
  //     } else {
  //       showToast(resData.message || '구독 요청에 실패했습니다.', 'error');
  //     }
  //   } catch (err) {
  //     if (isAxiosError(err)) {
  //       showToast(err.response?.data?.message || '구독 요청에 실패했습니다.', 'error');
  //     }
  //   } finally {
  //     setIsSubscribeLoading(false);
  //   }
  // };

  const handleWithdraw = async () => {
    setIsWithdrawLoading(true);
    try {
      const res = await api.patch<APIResponse<boolean>>('/api/members/withdrawal');
      const resData = res.data;
      const isSuccess = resData.isSuccess || resData.code === 'MEMBER2006';
      if (isSuccess) {
        showToast('탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.', 'info');
        removeAccessToken();
        navigate('/');
      } else {
        showToast(resData.message || '탈퇴 처리에 실패했습니다.', 'error');
        setShowWithdrawConfirm(false);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        showToast(err.response?.data?.message || '탈퇴 처리에 실패했습니다.', 'error');
      }
      setShowWithdrawConfirm(false);
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin', { replace: true });
      return;
    }
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
            <SectionTitle>마이페이지</SectionTitle>
          </SectionHeader>
            <InfoCard>
              <Label>불러오는 중...</Label>
            </InfoCard>
            <BackButton onClick={() => navigate('/')}>← 홈으로</BackButton>
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
            <InfoRow style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--dt-space-3)' }}>
              <Label>천장 스택</Label>
              {([
                { key: 'commonStack', label: 'COMMON', color: 'common' },
                { key: 'rareStack',   label: 'RARE',   color: 'rare'   },
                { key: 'epicStack',   label: 'EPIC',   color: 'epic'   },
              ] as const).map(({ key, label, color }) => {
                const val = userData?.[key] ?? 0;
                return (
                  <StackRow key={key}>
                    <StackLabel>{label}</StackLabel>
                    <StackBarWrap>
                      <StackBar $width={(val / 10) * 100} $color={STACK_COLORS[color]} />
                    </StackBarWrap>
                    <StackValue>{val} / 10</StackValue>
                  </StackRow>
                );
              })}
            </InfoRow>
          </InfoCard>

          <InfoCard>
            <ActionRow>
              <ActionButton $variant="secondary" onClick={() => navigate('/my-dummy')}>
                📚 내 잡지식 보관함 보기
              </ActionButton>
              {/* 구독 신청 — 서비스 준비 중, 재활성화 시 아래 주석 해제
              {!userData?.isSubscribe && (
                <ActionButton
                  $variant="accent"
                  onClick={handleSubscribe}
                  disabled={isSubscribeLoading}
                >
                  {isSubscribeLoading ? '처리 중...' : '✦ 구독 신청하기'}
                </ActionButton>
              )}
              */}
              {!showWithdrawConfirm ? (
                <ActionButton $variant="danger" onClick={() => setShowWithdrawConfirm(true)}>
                  회원 탈퇴
                </ActionButton>
              ) : (
                <ConfirmBox>
                  <ConfirmMessage>
                    정말 탈퇴하시겠어요? 모든 잡지식과 천장 스택이 사라져요.
                  </ConfirmMessage>
                  <ConfirmButtons>
                    <ConfirmBtn onClick={() => setShowWithdrawConfirm(false)} disabled={isWithdrawLoading}>
                      취소
                    </ConfirmBtn>
                    <ConfirmBtn $confirm onClick={handleWithdraw} disabled={isWithdrawLoading}>
                      {isWithdrawLoading ? '처리 중...' : '탈퇴 확인'}
                    </ConfirmBtn>
                  </ConfirmButtons>
                </ConfirmBox>
              )}
            </ActionRow>
          </InfoCard>
          <BackButton onClick={() => navigate('/')}>← 홈으로</BackButton>
        </Content>
      </Page>
    </>
  );
};

export default MyPage;
