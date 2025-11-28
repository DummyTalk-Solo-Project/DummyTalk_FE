// src/pages/QuizPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import type { APIResponse } from '../types/api'; // APIResponse 타입은 기존 파일을 가정

// --- Quiz Status Types (백엔드 DTO 기반 정의) ---
type QuizStatus = 'NOT_OPEN' | 'OPEN' | 'CLOSE';

interface QuizData {
    status: QuizStatus;
    userGrade: number;
    quizId: number;
    title: string;
    answerList: string[];
}

// --- Styled Components (메인 페이지 디자인 통일) ---

const MainContainer = styled.div`
    background-color: #333446;
    min-height: 100vh;
    width: 100vw;
    padding-top: 70px; /* Header 높이만큼 공간 확보 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const GradeText = styled.p`
    color: #B8CFCE;
    font-size: 1.2em;
    margin-bottom: 20px;
    font-weight: bold;
`;

const QuizTitle = styled.h1`
    color: #EAEFEF;
    font-size: 2.0em;
    margin-bottom: 30px;
    max-width: 80%;
    text-align: center;
`;

const AnswerListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 50%;
    min-width: 300px;
    max-width: 600px;
    margin-bottom: 30px;
    /* 퀴즈가 길어질 경우 중앙에서 위아래로 스크롤 가능하도록 설정 */
    max-height: 40vh; 
    overflow-y: auto;
    padding: 10px;
`;

const AnswerButton = styled.button<{ isSelected: boolean }>`
    background-color: ${props => (props.isSelected ? '#B8CFCE' : '#7F8CAA')};
    color: ${props => (props.isSelected ? '#333446' : '#EAEFEF')};
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 1.1em;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s, color 0.2s;
    /* 텍스트 줄바꿈 방지 및 줄임표는 사용하지 않음 (보기 옵션이 잘리지 않도록) */
    white-space: normal; 
    
    &:hover:not(:disabled) {
        background-color: ${props => (props.isSelected ? '#B8CFCE' : '#A0B4B3')};
    }
`;

const SubmitButton = styled.button`
    background-color: #ff5555; /* 포인트 색상: 제출 버튼 */
    color: #EAEFEF;
    border: none;
    border-radius: 10px;
    padding: 15px 30px;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;

    &:disabled {
        background-color: #555555;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background-color: #cc4444;
    }
`;

const InfoText = styled.p`
    color: #EAEFEF;
    font-size: 1.5em;
    margin-top: 20px;
`;


const QuizPage: React.FC = () => {
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // GET /api/dummies/quiz 요청 함수
    const fetchQuizInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // API 호출
            const response: AxiosResponse<APIResponse<QuizData>> = await api.get("/api/dummies/quiz");
            setQuizData(response.data.result);
        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "퀴즈 정보를 불러오는 데 실패했습니다.";
                setError(errorMessage);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // POST /api/dummies/quiz 요청 함수
    const handleSubmitAnswer = useCallback(async () => {
        // quizId와 선택된 답이 없으면 리턴
        if (quizData?.quizId === undefined || selectedAnswerIndex === null) return;
        
        setIsSubmitting(true);
        try {
            // 정답 제출 요청 (answer는 0부터 시작하는 index로 전달)
            await api.post("/api/dummies/quiz", null, {
                params: {
                    id: quizData.quizId,
                    answer: selectedAnswerIndex,
                }
            });
            
            alert("정답을 제출했습니다! 결과가 반영되었습니다.");
            
            // 퀴즈 제출 후, 퀴즈 상태를 갱신하기 위해 정보를 다시 불러옵니다 (CLOSE 상태로 전환 기대)
            fetchQuizInfo(); 

        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "정답 제출에 실패했습니다.";
                alert(`오류: ${errorMessage}`);
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsSubmitting(false);
            setSelectedAnswerIndex(null); 
        }
    }, [quizData, selectedAnswerIndex, fetchQuizInfo]);

    useEffect(() => {
        fetchQuizInfo();
    }, [fetchQuizInfo]);

    // --- Quiz Status 별 조건부 렌더링 ---
    const renderContent = () => {
        if (isLoading) {
            return <InfoText>퀴즈 정보를 불러오는 중입니다...</InfoText>;
        }
        if (error) {
            return <InfoText style={{ color: '#ff5555' }}>오류: {error}</InfoText>;
        }
        if (!quizData) {
             return <InfoText>퀴즈 정보가 없습니다. 관리자에게 문의하세요.</InfoText>;
        }

        const { status, userGrade, title, answerList } = quizData;
        
        // 1. NOT_OPEN 상태
        if (status === 'NOT_OPEN') {
            return (
                <>
                    <GradeText>현재 점수: {userGrade}점</GradeText>
                    <QuizTitle>오늘의 퀴즈는 아직 준비되지 않았습니다. 😭</QuizTitle>
                    <InfoText>내일 다시 시도해주세요!</InfoText>
                </>
            );
        }
        
        // 2. CLOSE 상태
        if (status === 'CLOSE') {
            return (
                <>
                    <GradeText>현재 점수: {userGrade}점</GradeText>
                    <QuizTitle>오늘의 퀴즈를 이미 풀었습니다. ✅</QuizTitle>
                    <InfoText>퀴즈는 하루에 한 번만 참여할 수 있습니다.</InfoText>
                </>
            );
        }
        
        // 3. OPEN 상태 (퀴즈 풀기)
        if (status === 'OPEN') {
            return (
                <>
                    <GradeText>현재 점수: {userGrade}점</GradeText>
                    <QuizTitle>{title}</QuizTitle>
                    <AnswerListContainer>
                        {answerList.map((answer, index) => (
                            <AnswerButton
                                key={index}
                                isSelected={selectedAnswerIndex === index}
                                onClick={() => setSelectedAnswerIndex(index)}
                                disabled={isSubmitting}
                            >
                                {index + 1}. {answer}
                            </AnswerButton>
                        ))}
                    </AnswerListContainer>
                    <SubmitButton 
                        onClick={handleSubmitAnswer} 
                        disabled={selectedAnswerIndex === null || isSubmitting}
                    >
                        {isSubmitting ? "제출 중..." : "정답 제출"}
                    </SubmitButton>
                </>
            );
        }

        return <InfoText>알 수 없는 퀴즈 상태입니다.</InfoText>;
    };

    return (
        <MainContainer>
            {renderContent()}
        </MainContainer>
    );
};

export default QuizPage;