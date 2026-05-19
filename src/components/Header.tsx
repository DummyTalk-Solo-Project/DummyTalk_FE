import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axiosInstance';
import { removeAccessToken } from '../utils/auth';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Nav = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--dt-space-6);

  background: rgba(20, 20, 27, 0.80);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--dt-stroke-faint);
`;

const Brand = styled(Link)`
  font-family: var(--dt-font-mono);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-bold);
  letter-spacing: var(--dt-tracking-glitch);
  text-transform: uppercase;
  color: var(--dt-lavender-300);
  text-decoration: none;
  transition: color var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-fg-primary);
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--dt-space-5);
`;

const NavLink = styled(Link)`
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-tertiary);
  text-decoration: none;
  transition: color var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-fg-primary);
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-fg-tertiary);
  cursor: pointer;
  transition: color var(--dt-dur-base) var(--dt-ease-snap);

  &:hover {
    color: var(--dt-danger);
  }
`;

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/members/logout');
    } catch {
      // API 실패해도 로컬 토큰 삭제 진행
    }
    removeAccessToken();
    onLogout();
    navigate('/', { replace: true });
  };

  return (
    <Nav>
      <Brand to="/">◈ DUMMYTALK</Brand>
      <NavLinks>
        <NavLink to="/notices">공지사항</NavLink>
        {isLoggedIn ? (
          <>
            <NavLink to="/my-dummy">내 더미들</NavLink>
            <NavLink to="/my-page">마이페이지</NavLink>
            <NavButton onClick={handleLogout}>로그아웃</NavButton>
          </>
        ) : (
          <>
            <NavLink to="/login">로그인</NavLink>
            <NavLink to="/sign-in">회원가입</NavLink>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

export default Header;
