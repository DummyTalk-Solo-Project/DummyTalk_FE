// src/components/IntroModal.tsx

import React from 'react';
import styled, { keyframes } from 'styled-components';

// ⭐️ 애니메이션 정의 (유령처럼 부드럽게 나타나도록)
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #333446; /* 메인 색상 */
  color: #EAEFEF;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out; /* 애니메이션 적용 */
`;

const CloseButton = styled.button`
  background-color: #7F8CAA;
  color: #EAEFEF;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  margin-top: 20px;
  cursor: pointer;
  &:hover { background-color: #B8CFCE; color: #333446; }
`;

const ModalImage = styled.img`
  width: 250px; /* 로고 크기 조정 */
  height: auto;
  margin-bottom: 20px;
`;


interface IntroModalProps {
  onClose: () => void;
  imageSrc: string; // 로고 이미지 경로를 받아옵니다.
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose, imageSrc }) => {

  const handleClose = () => {
    // ⭐️ Local Storage에 플래그 설정: "오늘 소개를 봤다"
    // localStorage.setItem(MODAL_KEY, 'true');
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalImage src={imageSrc} alt="Project Logo" />
        <h2>DummyTalk 소개</h2>
        <p>
          안녕하세요! 이 웹사이트는 백엔드 개발 학습을 위한 
          토이 프로젝트입니다. 
          새로고침을 통해 흥미로운 잡지식을 얻거나, 퀴즈를 풀어보세요!
        </p>
        <CloseButton onClick={handleClose}>
          시작하기
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default IntroModal;