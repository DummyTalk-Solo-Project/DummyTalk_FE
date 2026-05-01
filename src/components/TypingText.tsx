import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TextBody = styled.p`
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-md);
  font-weight: var(--dt-weight-regular);
  line-height: var(--dt-leading-relaxed);
  letter-spacing: var(--dt-tracking-wide);
  color: var(--dt-fg-primary);
  margin: 0;
  text-wrap: pretty;
  word-break: keep-all;
`;

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 40 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevText, setPrevText] = useState(text);

  // Prop 변경 시 상태 초기화 (Effect 대신 렌더링 도중 처리 - React 권장 패턴)
  if (text !== prevText) {
    setDisplayText('');
    setCurrentIndex(0);
    setPrevText(text);
  }

  useEffect(() => {
    if (text && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, speed]);

  if (!text) return null;

  return <TextBody>{displayText}</TextBody>;
};

export default TypingText;
