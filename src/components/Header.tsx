// components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import axios from 'axios'; // axios 추가
import { removeAccessToken } from '../utils/auth'; // JWT 삭제 유틸리티 함수 import

// Prop 타입을 정의하는 인터페이스 (onLogout 핸들러 추가)
interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void; // MainPage에서 전달받은 콜백 함수
}

// React.FC (Function Component)와 함께 Props 타입을 사용
const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  // 1. 로그아웃 처리 함수 정의
  const handleLogout = async () => {
    try {
      // 🚨 서버에 로그아웃 요청을 보냅니다. (토큰 무효화)
      // NOTE: JWT는 Axios Interceptor를 통해 Header에 자동으로 포함되어야 합니다.
      await axios.post("/api/users/logout"); 
    } catch (error) {
      console.error("Logout API failed, but proceeding with local cleanup:", error);
      // API 실패하더라도 로컬 토큰 삭제는 진행하여 로그아웃 상태를 만듭니다.
    }
    
    // 2. 로컬에서 JWT 삭제
    removeAccessToken();
    
    // 3. MainPage에 상태 변경을 알림 (Logged: false로 변경)
    onLogout(); 

    // 4. 메인 페이지로 이동
    navigate("/", { replace: true }); 
  };

  return (
    <header style={{ 
        color: '#EAEFEF', 
        padding: '20px 40px', 
        textAlign: 'right', 
        backgroundColor: '#333446', 
        width: '100%', 
    }}>
      <nav>
        {isLoggedIn ? (
          <>
            {/* 5. Logout Link를 Button으로 변경하고 handleLogout 함수 연결 */}
            <button 
                onClick={handleLogout} 
                style={{ 
                    color: '#7F8CAA', 
                    marginLeft: '15px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '1em' // Link 스타일과 맞추기 위해 폰트 크기 지정
                }}
            >
                Logout
            </button>
            <Link to="/my-page" style={{ color: '#7F8CAA', marginLeft: '15px' }}>MyPage</Link>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#7F8CAA', marginLeft: '15px' }}>Login</Link>
            <Link to="/sign-in" style={{ color: '#7F8CAA', marginLeft: '15px' }}>Sign In</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;