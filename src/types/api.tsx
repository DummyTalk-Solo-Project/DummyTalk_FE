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