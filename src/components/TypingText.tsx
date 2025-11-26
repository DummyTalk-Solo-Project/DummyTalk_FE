// src/components/TypingText.tsx

import React, { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number; // 한 글자 출력 속도 (ms)
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 50 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      // Effect 정리 함수 (컴포넌트 unmount 시 타이머 해제)
      return () => clearTimeout(timeout);
    }
    // currentIndex가 text.length와 같아지면 (모든 글자 출력 완료) 더 이상 실행되지 않음
  }, [text, currentIndex, speed]);

  // text가 바뀔 때마다 (새로운 퀴즈를 받아올 때마다) 상태 초기화
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <p>{displayText}</p>; // 실제 출력되는 부분
};

export default TypingText;