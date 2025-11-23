// components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

// Prop 타입을 정의하는 인터페이스
interface HeaderProps {
  isLoggedIn: boolean;
}

// React.FC (Function Component)와 함께 Props 타입을 사용
const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  return (
    <header style={{ 
        color: '#EAEFEF', 
        padding: '20px 40px', 
        textAlign: 'right', 
        backgroundColor: '#333446' 
    }}>
      <nav>
        {isLoggedIn ? (
          <>
            <Link to="/logout" style={{ color: '#7F8CAA', marginLeft: '15px' }}>Logout</Link>
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