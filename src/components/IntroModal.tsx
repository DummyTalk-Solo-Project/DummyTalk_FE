import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeRise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--dt-bg-overlay);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: var(--dt-space-6);
`;

const Modal = styled.div`
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-10) var(--dt-space-8);
  box-shadow: var(--dt-shadow-lg), var(--dt-glow-soft);

  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);

  animation: ${fadeRise} var(--dt-dur-rise) var(--dt-ease-rise) both;
`;

const Logo = styled.img`
  width: 88px;
  height: 88px;
  object-fit: contain;
  border-radius: var(--dt-radius-xl);
`;

const GlitchLabel = styled.p`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-xs);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  margin: 0;
`;

const Title = styled.h2`
  font-size: var(--dt-size-xl);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-tight);
  color: var(--dt-fg-primary);
  margin: 0;
`;

const Description = styled.p`
  font-size: var(--dt-size-sm);
  line-height: var(--dt-leading-relaxed);
  color: var(--dt-fg-secondary);
  margin: 0;
  word-break: keep-all;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--dt-stroke-faint);
  margin: var(--dt-space-1) 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--dt-space-3);
  width: 100%;
`;

const LoginButton = styled.button`
  flex: 1;
  background: var(--dt-accent);
  border: none;
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4);

  color: var(--dt-fg-on-accent);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-semibold);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    box-shadow: var(--dt-glow-bloom);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SignUpButton = styled.button`
  flex: 1;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--dt-stroke-soft);
  border-radius: var(--dt-radius-md);
  padding: var(--dt-space-4);

  color: var(--dt-fg-primary);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-base);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    border-color: var(--dt-stroke-accent);
    box-shadow: var(--dt-glow-soft);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;


interface IntroModalProps {
  onClose: () => void;
  imageSrc: string;
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose, imageSrc }) => {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Overlay>
      <Modal>
        <Logo src={imageSrc} alt="DummyTalk Logo" />
        <GlitchLabel>◈ SIGNAL DETECTED</GlitchLabel>
        <Title>DummyTalk</Title>
        <Description>
          미지의 유령이 보내는 잡학 지식 신호를 수신하세요.{'\n'}
          가챠로 뽑는 흥미로운 잡지식 서비스입니다.
        </Description>
        <Divider />
        <ButtonRow>
          <LoginButton onClick={() => goTo('/login')}>로그인</LoginButton>
          <SignUpButton onClick={() => goTo('/sign-in')}>회원가입</SignUpButton>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
};

export default IntroModal;
