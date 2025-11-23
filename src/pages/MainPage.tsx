// pages/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styled from 'styled-components';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { APIResponse } from '../types/api.tsx'; // 정의한 타입 불러오기

// --- Styled Components (디자인 적용) ---
const MainContainer = styled.div`
  background-color: #333446; /* 메인 색상 */
  
  /* 뷰포트 전체 높이를 채우도록 설정 */
  min-height: 100vh; 
  /* 뷰포트 전체 너비를 채우도록 설정 (기본값 100%이지만 명시) */
  width: 100vw; 

  /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 수평 중앙 정렬 */
  justify-content: center; /* 수직 중앙 정렬 */
  text-align: center;
`;

const TriviaText = styled.h1`
  color: #EAEFEF; /* 밝은 텍스트 */
  font-size: 2.5em;
  margin-bottom: 50px;
  max-width: 80%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 30px;
`;

const ActionButton = styled.button`
  background-color: #7F8CAA; /* 서브 색상 1 */
  color: #EAEFEF;
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;

  &:hover {
    background-color: #B8CFCE; /* 서브 색상 2 (Hover) */
    color: #333446; 
  }

  &:active {
    transform: scale(0.98);
  }
`;

// --- MainPage 컴포넌트 ---
// React.FC를 사용하여 컴포넌트 타입 명시
const MainPage: React.FC = () => {
  const [trivia, setTrivia] = useState<string>("안녕하세요 처음 뵙네요!"); // useState에 <string> 타입 명시
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // useState에 <boolean> 타입 명시
  const navigate = useNavigate();

  // 잡지식 텍스트를 서버에서 가져오는 함수
  const fetchTrivia = async () => {
    try {
      // APIResponse의 제네릭 T 자리에 string을 명시
      const response: AxiosResponse<APIResponse<string>> = await axios.get("/api/dummies/get-dummy"); 
      
      // 타입 체크를 통해 안전하게 데이터 접근
      if (response.data.success && response.data.result) {
        setTrivia(response.data.result); // result는 string 타입으로 확정
      } else {
        setTrivia(response.data.message || "잡지식을 불러오는 데 실패했어요. 다시 시도해 주세요.");
      }
    } catch (error) {
      // AxiosError 타입 확인을 위한 instanceof 사용 (선택 사항이나 권장)
      if (axios.isAxiosError(error)) {
        console.error("API 호출 에러:", error.message);
      } else {
        console.error("알 수 없는 에러:", error);
      }
      setTrivia("서버와 통신할 수 없습니다. 백엔드 상태를 확인해 주세요.");
    }
  };

  // ... useEffect, handleRefreshClick, handleQuizClick 로직은 동일

  useEffect(() => {
    // JWT 토큰 유무 확인 로직으로 setIsLoggedIn(true/false) 설정 필요
  }, []);

  const handleRefreshClick = () => {
    fetchTrivia();
  };

  const handleQuizClick = () => {
    navigate("/quiz");
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} /> 
      <MainContainer>
        <TriviaText>{trivia}</TriviaText>
        <ButtonGroup>
          <ActionButton onClick={handleRefreshClick}>
            ✨ 잡지식 새로고침
          </ActionButton>
          <ActionButton onClick={handleQuizClick}>
            🧠 퀴즈 풀기!
          </ActionButton>
        </ButtonGroup>
      </MainContainer>
    </>
  );
};

export default MainPage;