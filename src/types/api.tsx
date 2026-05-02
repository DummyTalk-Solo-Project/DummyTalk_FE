// 공통 응답 래퍼 — 최상위 isSuccess 필드 (BE 실제 반환값 기준)
export interface APIResponse<T> {
  isSuccess: boolean;
  success?: boolean; // 백엔드 필드명 혼용 대비
  code: string;
  message: string;
  result: T | null;
}

// ── Quiz ──────────────────────────────────────────────────────
export type QuizStatus = 'NOT_OPEN' | 'OPEN' | 'CLOSE';

export interface QuizResponseDTO {
  status: QuizStatus;
  userGrade: number | null; // BE: 미구현, 항상 null
  quizId: number;
  title: string;
  answerList: string[];
}

// ── Dummy (가챠) ───────────────────────────────────────────────
export type RarityName = 'COMMON' | 'RARE' | 'EPIC' | 'SPECIAL';

export interface DummyResponseDTO {
  dummyId: number;
  title: string;
  content: string;
  rarityName: RarityName;
  isPityTriggered: boolean;     // 이번 뽑기가 천장 발동으로 획득된 경우
  isNextPityTriggered: boolean; // 다음 뽑기에서 천장 발동 확정인 경우
  remainingCount: number;
}

export interface MyDummyItemDTO {
  dummyId: number;
  title: string;
  content: string;
  name: RarityName;
  createdAt: string; // ISO 8601
  rarityId: number;
  colorCode: string; // HEX
}

// ── Member ─────────────────────────────────────────────────────
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginSuccessDTO {
  isSuccess: boolean;
  memberName: string;
  accessToken: string;
}

export interface VerificationRequestDTO {
  email: string;
  code: string;
}

export interface SignInRequestDTO {
  username: string;
  email: string;
  password: string;
}

export interface MyPageDTO {
  memberName: string;
  email: string;
  reqCount: number;
  isSubscribe: boolean;
  subsExprDate: string | null; // ISO 8601, 미구독 시 null
  commonStack: number;
  rareStack: number;
  epicStack: number;
}
