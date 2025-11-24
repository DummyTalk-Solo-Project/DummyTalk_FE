// types/api.ts

// 백엔드 전체 응답 형식
export interface APIResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null; // T는 데이터 타입, result는 데이터가 없을 때 null일 수 있음
}

// DummyControllerV2.getQuiz API 응답 데이터 형식
export type QuizStatus = "NOT_OPEN" | "OPEN" | "CLOSE";

export interface GetQuizInfoResponseDTO {
  status: QuizStatus; 
  userGrade: number; // Integer (Java) -> number (TS)
  quizId: number;    // Long (Java) -> number (TS)
  title: string;
  answerList: string[]; // List<String> (Java) -> string[] (TS)
}

// types/api.ts (추가)
// LoginRequestDTO 타입
export interface LoginRequestDTO {
  email: string;
  password: string;
}

// LoginSuccessDTO 타입 (백엔드가 응답 본문에 username을 주지만, Header에만 JWT를 주므로 필요 없을 수도 있음)
export interface LoginSuccessDTO {
  username: string; // 사용자 이름
  accessToken: string;
}

// types/api.ts (추가)
// VerificationRequestDTO 타입
export interface VerificationRequestDTO {
    email: string;
    code: string;
}

// SignInRequestDTO 타입
export interface SignInRequestDTO {
    username: string;
    email: string;
    password: string;
}