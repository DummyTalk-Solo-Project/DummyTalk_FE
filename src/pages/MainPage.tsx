// pages/MainPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styled from 'styled-components';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { APIResponse } from '../types/api.tsx'; // 정의한 타입 불러오기

// (Styled Components는 동일하므로 생략 - 파일은 .tsx에 같이 있어도 무방)
const MainContainer = styled.div`
  background-color: #333446;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
// ... (TriviaText, ButtonGroup, ActionButton styled components 생략)

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