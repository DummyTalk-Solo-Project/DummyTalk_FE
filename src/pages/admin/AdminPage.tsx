import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { isAxiosError } from 'axios';
import api from '../../api/axiosInstance';
import type {
  APIResponse,
  SettlementDTO,
  NoticeListItemDTO,
  NoticeDetailDTO,
  AdminQuizDTO,
  SchedulerStatusDTO,
} from '../../types/api';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import { isLoggedIn } from '../../utils/auth';

// ── Animations ───────────────────────────────────────────────
const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

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
  max-width: var(--dt-content-wide);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-6);
  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const PageLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-danger);
  margin: 0;
`;

const PageTitle = styled.h1`
  font-size: var(--dt-size-2xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
  margin: 0 0 var(--dt-space-2);
`;

// ── Home Menu ─────────────────────────────────────────────────
const HomeCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-10);
  width: 100%;
`;

const HomeHeader = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
`;

const HomeSubtitle = styled.p`
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-tertiary);
  margin: 0;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--dt-space-4);
  width: 100%;
  max-width: 480px;
`;

const MenuCard = styled.button`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-8) var(--dt-space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);
  box-shadow: var(--dt-shadow-sm);

  &:hover {
    border-color: var(--dt-stroke-accent);
    box-shadow: var(--dt-glow-soft);
    transform: translateY(-2px);
    background: var(--dt-bg-elevated);
  }
`;

const MenuSymbol = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-2xl);
  color: var(--dt-accent);
  line-height: 1;
`;

const MenuLabel = styled.span`
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-fg-primary);
  letter-spacing: var(--dt-tracking-normal);
`;

const MenuDesc = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-disabled);
  letter-spacing: var(--dt-tracking-wide);
  text-transform: uppercase;
`;

// ── Sub-view Header ───────────────────────────────────────────
const SubViewHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-1);
`;

const BackButton = styled.button`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-2) var(--dt-space-4);
  color: var(--dt-fg-secondary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-2);
  align-self: center;
  margin-top: var(--dt-space-6);
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-fg-primary);
    border-color: var(--dt-stroke-strong);
  }
`;

// ── Common Card ──────────────────────────────────────────────
const Card = styled.div`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-6);
  box-shadow: var(--dt-shadow-md);
`;

const CardTitle = styled.h3`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-secondary);
  margin: 0 0 var(--dt-space-4);
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-wide);
`;

const Row = styled.div`
  display: flex;
  gap: var(--dt-space-3);
  align-items: flex-end;
  flex-wrap: wrap;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  flex: 1;
  min-width: 140px;
`;

const Label = styled.label`
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
  font-weight: var(--dt-weight-medium);
`;

const Input = styled.input`
  width: 100%;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);
  box-sizing: border-box;
  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  outline: none;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap);

  &:focus {
    border-color: var(--dt-stroke-accent);
    box-shadow: 0 0 0 3px rgba(154, 123, 240, 0.12);
  }
  &::placeholder { color: var(--dt-fg-disabled); }
`;

const Textarea = styled.textarea`
  width: 100%;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-4);
  box-sizing: border-box;
  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: border-color var(--dt-dur-base) var(--dt-ease-snap);

  &:focus {
    border-color: var(--dt-stroke-accent);
    box-shadow: 0 0 0 3px rgba(154, 123, 240, 0.12);
  }
  &::placeholder { color: var(--dt-fg-disabled); }
`;

const PrimaryButton = styled.button`
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-5);
  color: var(--dt-fg-on-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) { box-shadow: var(--dt-glow-soft); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-3) var(--dt-space-5);
  color: var(--dt-fg-secondary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover:not(:disabled) { color: var(--dt-fg-primary); border-color: var(--dt-stroke-strong); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--dt-stroke-faint);
  margin: var(--dt-space-4) 0;
`;

const GlitchText = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  letter-spacing: var(--dt-tracking-glitch);
  color: var(--dt-fg-disabled);
  text-align: center;
  margin: var(--dt-space-6) 0;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: var(--dt-space-3);
`;

const StatCard = styled.div`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-faint);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-1);
`;

const StatLabel = styled.span`
  font-size: var(--dt-size-xs);
  color: var(--dt-fg-tertiary);
`;

const StatValue = styled.span`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-lg);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-fg-primary);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dt-size-xs);
`;

const Th = styled.th`
  text-align: left;
  padding: var(--dt-space-2) var(--dt-space-3);
  color: var(--dt-fg-tertiary);
  font-weight: var(--dt-weight-medium);
  border-bottom: 1px solid var(--dt-stroke-faint);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: var(--dt-space-2) var(--dt-space-3);
  color: var(--dt-fg-secondary);
  border-bottom: 1px solid var(--dt-stroke-faint);
  font-family: var(--dt-font-mono);
`;

// ── Notice List Styles ────────────────────────────────────────
const NoticeRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4) 0;
  border-bottom: 1px solid var(--dt-stroke-faint);
  &:last-child { border-bottom: none; }
`;

const NoticeInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-1);
`;

const NoticeTitle = styled.span`
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoticeBadges = styled.div`
  display: flex;
  gap: var(--dt-space-2);
  align-items: center;
`;

const Badge = styled.span<{ $variant: 'pin' | 'published' | 'draft' }>`
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-bold);
  border-radius: var(--dt-radius-pill);
  padding: 1px var(--dt-space-2);
  ${({ $variant }) => {
    if ($variant === 'pin') return `
      color: var(--dt-warning);
      background: rgba(232, 197, 106, 0.12);
      border: 1px solid rgba(232, 197, 106, 0.25);
    `;
    if ($variant === 'published') return `
      color: var(--dt-success);
      background: rgba(111, 217, 168, 0.12);
      border: 1px solid rgba(111, 217, 168, 0.25);
    `;
    return `
      color: var(--dt-fg-disabled);
      background: var(--dt-bg-elevated);
      border: 1px solid var(--dt-stroke-faint);
    `;
  }}
`;

const NoticeActions = styled.div`
  display: flex;
  gap: var(--dt-space-2);
  flex-shrink: 0;
`;

const SmallButton = styled.button<{ $variant?: 'danger' }>`
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-faint);
  border-radius: var(--dt-radius-sm);
  padding: var(--dt-space-1) var(--dt-space-3);
  font-size: var(--dt-size-xs);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-quick) var(--dt-ease-snap);
  color: ${({ $variant }) => $variant === 'danger' ? 'var(--dt-danger)' : 'var(--dt-fg-secondary)'};
  border-color: ${({ $variant }) => $variant === 'danger' ? 'rgba(224,122,142,0.25)' : 'var(--dt-stroke-faint)'};

  &:hover:not(:disabled) {
    color: ${({ $variant }) => $variant === 'danger' ? 'var(--dt-danger)' : 'var(--dt-fg-primary)'};
    border-color: ${({ $variant }) => $variant === 'danger' ? 'var(--dt-danger)' : 'var(--dt-stroke-strong)'};
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  cursor: pointer;
  font-size: var(--dt-size-sm);
  color: var(--dt-fg-secondary);
  user-select: none;
`;

const SectionTitle = styled.h2`
  font-size: var(--dt-size-lg);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-fg-primary);
  margin: 0;
`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

// ══════════════════════════════════════════════════════════════
// Dashboard (정산 확인)
// ══════════════════════════════════════════════════════════════
const SettlementStatCards: React.FC<{ data: SettlementDTO }> = ({ data }) => (
  <StatGrid>
    <StatCard><StatLabel>날짜</StatLabel><StatValue style={{ fontSize: 'var(--dt-size-sm)' }}>{data.settlementDate}</StatValue></StatCard>
    <StatCard><StatLabel>총 뽑기</StatLabel><StatValue>{data.totalDummyViews.toLocaleString()}</StatValue></StatCard>
    <StatCard><StatLabel>신규 회원</StatLabel><StatValue>{data.newMemberCount}</StatValue></StatCard>
    <StatCard><StatLabel>활성 회원</StatLabel><StatValue>{data.activeMemberCount}</StatValue></StatCard>
    <StatCard><StatLabel>활성 구독</StatLabel><StatValue>{data.activeSubscriberCount}</StatValue></StatCard>
    <StatCard><StatLabel>COMMON</StatLabel><StatValue style={{ color: 'var(--dt-rarity-common)' }}>{data.commonCount}</StatValue></StatCard>
    <StatCard><StatLabel>RARE</StatLabel><StatValue style={{ color: 'var(--dt-rarity-rare)' }}>{data.rareCount}</StatValue></StatCard>
    <StatCard><StatLabel>EPIC</StatLabel><StatValue style={{ color: 'var(--dt-rarity-epic)' }}>{data.epicCount}</StatValue></StatCard>
    <StatCard><StatLabel>SPECIAL</StatLabel><StatValue style={{ color: 'var(--dt-rarity-special)' }}>{data.specialCount}</StatValue></StatCard>
  </StatGrid>
);

const DashboardView: React.FC = () => {
  const { showToast } = useToast();

  const [dailyDate, setDailyDate] = useState('');
  const [dailyData, setDailyData] = useState<SettlementDTO | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [rangeData, setRangeData] = useState<SettlementDTO[]>([]);
  const [isRangeLoading, setIsRangeLoading] = useState(false);

  const [latestDays, setLatestDays] = useState('7');
  const [latestData, setLatestData] = useState<SettlementDTO[]>([]);
  const [isLatestLoading, setIsLatestLoading] = useState(false);

  const fetchDaily = async () => {
    if (!dailyDate) return;
    setIsDailyLoading(true);
    setDailyData(null);
    try {
      const res = await api.get<APIResponse<SettlementDTO>>(`/api/admin/dashboard/daily?date=${dailyDate}`);
      setDailyData(res.data.result);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '조회 실패', 'error');
    } finally {
      setIsDailyLoading(false);
    }
  };

  const fetchRange = async () => {
    if (!rangeFrom || !rangeTo) return;
    setIsRangeLoading(true);
    setRangeData([]);
    try {
      const res = await api.get<APIResponse<SettlementDTO[]>>(
        `/api/admin/dashboard/range?from=${rangeFrom}&to=${rangeTo}`
      );
      setRangeData(res.data.result ?? []);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '조회 실패', 'error');
    } finally {
      setIsRangeLoading(false);
    }
  };

  const fetchLatest = async () => {
    setIsLatestLoading(true);
    setLatestData([]);
    try {
      const res = await api.get<APIResponse<SettlementDTO[]>>(
        `/api/admin/dashboard/latest?days=${latestDays}`
      );
      setLatestData(res.data.result ?? []);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '조회 실패', 'error');
    } finally {
      setIsLatestLoading(false);
    }
  };

  const renderSettlementTable = (data: SettlementDTO[]) => (
    <div style={{ overflowX: 'auto' }}>
      <Table>
        <thead>
          <tr>
            <Th>날짜</Th><Th>총 뽑기</Th><Th>신규</Th><Th>활성</Th><Th>구독</Th>
            <Th>C</Th><Th>R</Th><Th>E</Th><Th>S</Th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.settlementDate}>
              <Td>{row.settlementDate}</Td>
              <Td>{row.totalDummyViews.toLocaleString()}</Td>
              <Td>{row.newMemberCount}</Td>
              <Td>{row.activeMemberCount}</Td>
              <Td>{row.activeSubscriberCount}</Td>
              <Td style={{ color: 'var(--dt-rarity-common)' }}>{row.commonCount}</Td>
              <Td style={{ color: 'var(--dt-rarity-rare)' }}>{row.rareCount}</Td>
              <Td style={{ color: 'var(--dt-rarity-epic)' }}>{row.epicCount}</Td>
              <Td style={{ color: 'var(--dt-rarity-special)' }}>{row.specialCount}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--dt-space-5)' }}>
      <Card>
        <CardTitle>정산 단건 조회</CardTitle>
        <Row>
          <FieldGroup>
            <Label>날짜 (오늘 불가)</Label>
            <Input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} />
          </FieldGroup>
          <PrimaryButton onClick={fetchDaily} disabled={isDailyLoading || !dailyDate}>
            {isDailyLoading ? '조회 중...' : '조회'}
          </PrimaryButton>
        </Row>
        {dailyData && (<><Divider /><SettlementStatCards data={dailyData} /></>)}
      </Card>

      <Card>
        <CardTitle>기간별 정산 조회</CardTitle>
        <Row>
          <FieldGroup>
            <Label>시작일</Label>
            <Input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>종료일</Label>
            <Input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} />
          </FieldGroup>
          <PrimaryButton onClick={fetchRange} disabled={isRangeLoading || !rangeFrom || !rangeTo}>
            {isRangeLoading ? '조회 중...' : '조회'}
          </PrimaryButton>
        </Row>
        {rangeData.length > 0 && (<><Divider />{renderSettlementTable(rangeData)}</>)}
      </Card>

      <Card>
        <CardTitle>최근 N일 정산 조회</CardTitle>
        <Row>
          <FieldGroup>
            <Label>최근 며칠</Label>
            <Input
              type="number"
              min="1"
              max="365"
              value={latestDays}
              onChange={e => setLatestDays(e.target.value)}
            />
          </FieldGroup>
          <PrimaryButton onClick={fetchLatest} disabled={isLatestLoading}>
            {isLatestLoading ? '조회 중...' : '조회'}
          </PrimaryButton>
        </Row>
        {latestData.length > 0 && (<><Divider />{renderSettlementTable(latestData)}</>)}
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Notice (공지사항 관리)
// ══════════════════════════════════════════════════════════════
const NoticeView: React.FC = () => {
  const { showToast } = useToast();

  const [notices, setNotices] = useState<NoticeListItemDTO[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const PAGE_SIZE = 20;

  const fetchNotices = useCallback(async (page: number, append: boolean) => {
    if (!append) setIsListLoading(true);
    try {
      const res = await api.get<APIResponse<NoticeListItemDTO[]>>(`/api/admin/notices?page=${page}`);
      const data = res.data.result ?? [];
      setNotices(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '공지사항 로딩 실패', 'error');
    } finally {
      setIsListLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchNotices(0, false); }, [fetchNotices]);

  const openCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    setFormIsPinned(false);
    setShowForm(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await api.get<APIResponse<NoticeDetailDTO>>(`/api/admin/notices/${id}`);
      const detail = res.data.result;
      if (detail) {
        setEditingId(id);
        setFormTitle(detail.title);
        setFormContent(detail.content);
        setFormIsPinned(detail.isPinned);
        setShowForm(true);
      }
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '상세 로딩 실패', 'error');
    }
  };

  const handleSubmitForm = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }
    setIsFormLoading(true);
    try {
      if (editingId === null) {
        await api.post('/api/admin/notices', { title: formTitle, content: formContent, isPinned: formIsPinned });
        showToast('공지사항이 작성되었습니다. (비공개 상태)', 'success');
      } else {
        await api.patch(`/api/admin/notices/${editingId}`, { title: formTitle, content: formContent, isPinned: formIsPinned });
        showToast('공지사항이 수정되었습니다.', 'success');
      }
      setShowForm(false);
      fetchNotices(0, false);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '저장 실패', 'error');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/notices/${id}`);
      showToast('공지사항이 삭제되었습니다.', 'success');
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '삭제 실패', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleTogglePublish = async (id: number) => {
    setTogglingId(id);
    try {
      const res = await api.patch<APIResponse<boolean>>(`/api/admin/notices/${id}/publish`);
      const newPublished = res.data.result;
      setNotices(prev =>
        prev.map(n => n.id === id ? { ...n, isPublished: newPublished ?? !n.isPublished } : n)
      );
      showToast(newPublished ? '공개 처리되었습니다.' : '비공개 처리되었습니다.', 'success');
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '토글 실패', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--dt-space-5)' }}>
      {showForm && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--dt-space-4)' }}>
            <SectionTitle style={{ fontSize: 'var(--dt-size-base)' }}>
              {editingId === null ? '새 공지사항 작성' : '공지사항 수정'}
            </SectionTitle>
            <SecondaryButton onClick={() => setShowForm(false)}>취소</SecondaryButton>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--dt-space-3)' }}>
            <FieldGroup>
              <Label>제목</Label>
              <Input placeholder="공지사항 제목" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>내용</Label>
              <Textarea placeholder="공지사항 내용을 입력하세요." value={formContent} onChange={e => setFormContent(e.target.value)} />
            </FieldGroup>
            <CheckboxRow>
              <input type="checkbox" checked={formIsPinned} onChange={e => setFormIsPinned(e.target.checked)} />
              상단 고정
            </CheckboxRow>
            <PrimaryButton onClick={handleSubmitForm} disabled={isFormLoading} style={{ alignSelf: 'flex-start' }}>
              {isFormLoading ? '저장 중...' : (editingId === null ? '작성' : '수정')}
            </PrimaryButton>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--dt-space-4)' }}>
          <CardTitle style={{ margin: 0 }}>공지사항 목록 (비공개 포함)</CardTitle>
          {!showForm && <PrimaryButton onClick={openCreate}>+ 새 공지사항</PrimaryButton>}
        </div>

        {isListLoading ? (
          <GlitchText>█▒░ LOADING ░▒█</GlitchText>
        ) : notices.length === 0 ? (
          <p style={{ color: 'var(--dt-fg-disabled)', fontSize: 'var(--dt-size-sm)', textAlign: 'center', padding: 'var(--dt-space-8) 0' }}>
            공지사항이 없습니다.
          </p>
        ) : (
          notices.map(notice => (
            <NoticeRow key={notice.id}>
              <NoticeInfo>
                <NoticeTitle>{notice.title}</NoticeTitle>
                <NoticeBadges>
                  {notice.isPinned && <Badge $variant="pin">📌 고정</Badge>}
                  <Badge $variant={notice.isPublished ? 'published' : 'draft'}>
                    {notice.isPublished ? '공개' : '비공개'}
                  </Badge>
                  <span style={{ fontSize: 'var(--dt-size-xs)', color: 'var(--dt-fg-disabled)', fontFamily: 'var(--dt-font-mono)' }}>
                    {formatDate(notice.createdAt)}
                  </span>
                </NoticeBadges>
              </NoticeInfo>
              <NoticeActions>
                {deleteConfirmId === notice.id ? (
                  <>
                    <SmallButton $variant="danger" onClick={() => handleDelete(notice.id)}>확인</SmallButton>
                    <SmallButton onClick={() => setDeleteConfirmId(null)}>취소</SmallButton>
                  </>
                ) : (
                  <>
                    <SmallButton onClick={() => handleTogglePublish(notice.id)} disabled={togglingId === notice.id}>
                      {notice.isPublished ? '비공개' : '공개'}
                    </SmallButton>
                    <SmallButton onClick={() => openEdit(notice.id)}>수정</SmallButton>
                    <SmallButton $variant="danger" onClick={() => setDeleteConfirmId(notice.id)}>삭제</SmallButton>
                  </>
                )}
              </NoticeActions>
            </NoticeRow>
          ))
        )}

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 'var(--dt-space-4)' }}>
            <SecondaryButton onClick={() => fetchNotices(currentPage + 1, true)}>더 보기</SecondaryButton>
          </div>
        )}
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Quiz (퀴즈 관리)
// ══════════════════════════════════════════════════════════════
const QuizView: React.FC = () => {
  const { showToast } = useToast();

  const [openTime, setOpenTime] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [openResult, setOpenResult] = useState<AdminQuizDTO | null>(null);

  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatusDTO | null>(null);
  const [isCheckingScheduler, setIsCheckingScheduler] = useState(false);

  const handleOpenQuiz = async () => {
    if (!openTime) return;
    setIsOpening(true);
    setOpenResult(null);
    try {
      const isoTime = openTime.length === 16 ? `${openTime}:00` : openTime;
      const res = await api.post<APIResponse<AdminQuizDTO>>(
        '/api/admin/quiz/open',
        null,
        { params: { 'open-time': isoTime } }
      );
      setOpenResult(res.data.result);
      showToast('퀴즈가 오픈되었습니다!', 'success');
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '퀴즈 오픈 실패', 'error');
    } finally {
      setIsOpening(false);
    }
  };

  const checkScheduler = async () => {
    setIsCheckingScheduler(true);
    try {
      const res = await api.get<APIResponse<SchedulerStatusDTO>>('/api/admin/check-quiz');
      setSchedulerStatus(res.data.result);
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '스케줄러 확인 실패', 'error');
    } finally {
      setIsCheckingScheduler(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--dt-space-5)' }}>
      <Card>
        <CardTitle>퀴즈 오픈</CardTitle>
        <Row>
          <FieldGroup>
            <Label>오픈 시각 (현재 시간 이후 · 5분 뒤 자동 종료)</Label>
            <Input type="datetime-local" value={openTime} onChange={e => setOpenTime(e.target.value)} />
          </FieldGroup>
          <PrimaryButton onClick={handleOpenQuiz} disabled={isOpening || !openTime}>
            {isOpening ? '오픈 중...' : '퀴즈 오픈'}
          </PrimaryButton>
        </Row>
        {openResult && (
          <>
            <Divider />
            <StatGrid>
              <StatCard><StatLabel>퀴즈 ID</StatLabel><StatValue>{openResult.id}</StatValue></StatCard>
              <StatCard><StatLabel>상태</StatLabel><StatValue style={{ fontSize: 'var(--dt-size-sm)' }}>{openResult.status}</StatValue></StatCard>
              <StatCard><StatLabel>티켓</StatLabel><StatValue>{openResult.ticket}</StatValue></StatCard>
              <StatCard><StatLabel>오픈</StatLabel><StatValue style={{ fontSize: 'var(--dt-size-xs)' }}>{openResult.startTime?.slice(11, 16)}</StatValue></StatCard>
              <StatCard><StatLabel>종료</StatLabel><StatValue style={{ fontSize: 'var(--dt-size-xs)' }}>{openResult.endTime?.slice(11, 16)}</StatValue></StatCard>
            </StatGrid>
            <p style={{ margin: 'var(--dt-space-3) 0 0', fontSize: 'var(--dt-size-sm)', color: 'var(--dt-fg-secondary)' }}>
              {openResult.title}
            </p>
            {openResult.answerList && (
              <div style={{ marginTop: 'var(--dt-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--dt-space-2)' }}>
                {openResult.answerList.map((ans, i) => (
                  <p
                    key={i}
                    style={{
                      margin: 0,
                      fontSize: 'var(--dt-size-sm)',
                      color: i + 1 === openResult.answer ? 'var(--dt-success)' : 'var(--dt-fg-tertiary)',
                      fontFamily: 'var(--dt-font-mono)',
                    }}
                  >
                    {i + 1 === openResult.answer ? '▶ ' : '  '}{i + 1}. {ans}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <Card>
        <CardTitle>스케줄러 상태 확인</CardTitle>
        <PrimaryButton onClick={checkScheduler} disabled={isCheckingScheduler}>
          {isCheckingScheduler ? '확인 중...' : '상태 확인'}
        </PrimaryButton>
        {schedulerStatus && (
          <>
            <Divider />
            <StatGrid>
              <StatCard><StatLabel>활성 스레드</StatLabel><StatValue>{schedulerStatus.activeCount}</StatValue></StatCard>
              <StatCard><StatLabel>풀 크기</StatLabel><StatValue>{schedulerStatus.poolSize}</StatValue></StatCard>
            </StatGrid>
          </>
        )}
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Member (회원 관리)
// ══════════════════════════════════════════════════════════════
const MemberView: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await api.patch('/api/admin/members/subscribe', null, { params: { email } });
      showToast(`${email} 구독 승인 완료`, 'success');
      setEmail('');
    } catch (err) {
      if (isAxiosError(err)) showToast(err.response?.data?.message || '구독 승인 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>구독 승인</CardTitle>
      <Row>
        <FieldGroup>
          <Label>회원 이메일</Label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleApprove(); }}
          />
        </FieldGroup>
        <PrimaryButton onClick={handleApprove} disabled={isLoading || !email.trim()}>
          {isLoading ? '처리 중...' : '구독 승인'}
        </PrimaryButton>
      </Row>
    </Card>
  );
};

// ══════════════════════════════════════════════════════════════
// Main AdminPage
// ══════════════════════════════════════════════════════════════
type ViewId = 'home' | 'dashboard' | 'notices' | 'quiz' | 'members';

const VIEW_META: Record<Exclude<ViewId, 'home'>, { symbol: string; label: string; desc: string; title: string }> = {
  dashboard: { symbol: '∑', label: '정산 확인',    desc: 'SETTLEMENT',  title: '정산 대시보드' },
  notices:   { symbol: '◈', label: '공지사항 관리', desc: 'NOTICE',      title: '공지사항 관리' },
  quiz:      { symbol: '◇', label: '퀴즈 관리',    desc: 'QUIZ',        title: '퀴즈 관리' },
  members:   { symbol: '○', label: '회원 관리',    desc: 'MEMBER',      title: '회원 관리' },
};

const AdminPage: React.FC = () => {
  const [view, setView] = useState<ViewId>('home');
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login', { replace: true });
    }
  }, [loggedIn, navigate]);

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'notices':   return <NoticeView />;
      case 'quiz':      return <QuizView />;
      case 'members':   return <MemberView />;
      default:          return null;
    }
  };

  return (
    <>
      <Header isLoggedIn={loggedIn} onLogout={() => navigate('/')} isAdmin />
      <Page>
        <Content>
          {view === 'home' ? (
            <HomeCenter>
              <HomeHeader>
                <PageLabel>◈ ADMIN CONTROL</PageLabel>
                <PageTitle>관리자 패널</PageTitle>
                <HomeSubtitle>관리할 항목을 선택하세요</HomeSubtitle>
              </HomeHeader>
              <MenuGrid>
                {(Object.entries(VIEW_META) as [Exclude<ViewId, 'home'>, typeof VIEW_META[Exclude<ViewId, 'home'>]][]).map(([id, meta]) => (
                  <MenuCard key={id} onClick={() => setView(id)}>
                    <MenuSymbol>{meta.symbol}</MenuSymbol>
                    <MenuLabel>{meta.label}</MenuLabel>
                    <MenuDesc>{meta.desc}</MenuDesc>
                  </MenuCard>
                ))}
              </MenuGrid>
            </HomeCenter>
          ) : (
            <>
              <SubViewHeader>
                <PageLabel>◈ ADMIN CONTROL</PageLabel>
                <PageTitle style={{ margin: 0 }}>{VIEW_META[view].title}</PageTitle>
              </SubViewHeader>
              {renderView()}
              <BackButton onClick={() => setView('home')}>← 관리자 패널로</BackButton>
            </>
          )}
        </Content>
      </Page>
    </>
  );
};

export default AdminPage;
