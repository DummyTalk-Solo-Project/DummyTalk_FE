// pages/MainPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styled from 'styled-components';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { APIResponse } from '../types/api.tsx'; // 정의한 타입 불러오기
import { removeAccessToken, isLoggedIn } from '../utils/auth';

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

// NOTE: HeaderProps 인터페이스 정의는 Header.tsx 파일에 있어야 합니다. 
// MainPage에서는 Header 컴포넌트와 그 Prop을 사용하기만 합니다. 

// --- MainPage 컴포넌트 ---
const MainPage: React.FC = () => {
  const [trivia, setTrivia] = useState<string>("안녕하세요 처음 뵙네요!"); 
  // 1. 상태 변수 이름을 'logged'로 변경하고, 초기값을 isLoggedIn() 함수로 설정
  const [logged, setLogged] = useState<boolean>(isLoggedIn()); 
  const navigate = useNavigate();

  // 2. 로그아웃 성공 시 호출될 콜백 함수 정의
  const handleLogoutSuccess = useCallback(() => {
      // 로그아웃 시 logged 상태를 false로 업데이트
      setLogged(false);
  }, []);

  // 잡지식 텍스트를 서버에서 가져오는 함수 (변동 없음)
  const fetchTrivia = async () => {
    try {
      const response: AxiosResponse<APIResponse<string>> = await axios.get("/api/dummies/get-dummy"); 
      
      if (response.data.success && response.data.result) {
        setTrivia(response.data.result); 
      } else {
        setTrivia(response.data.message || "잡지식을 불러오는 데 실패했어요. 다시 시도해 주세요.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API 호출 에러:", error.message);
      } else {
        console.error("알 수 없는 에러:", error);
      }
      setTrivia("서버와 통신할 수 없습니다. 백엔드 상태를 확인해 주세요.");
    }
  };

  // 3. 컴포넌트 마운트 시 최초 로그인 상태 확인
  useEffect(() => {
    // 최초 마운트 시, isLoggedIn() 결과로 logged 상태를 다시 한 번 정확히 설정
    setLogged(isLoggedIn());
    // (선택 사항) 로그인 여부에 관계없이 잡지식 로딩이 필요하다면 여기서 fetchTrivia() 호출
  }, []);

  const handleRefreshClick = () => {
    fetchTrivia();
  };

  const handleQuizClick = () => {
    navigate("/quiz");
  };

  return (
    <>
      {/* 4. Header에 logged 상태와 로그아웃 핸들러를 전달 */}
      <Header isLoggedIn={logged} onLogout={handleLogoutSuccess} /> 
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