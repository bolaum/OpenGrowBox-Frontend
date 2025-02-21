import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MdOutlineDashboard, MdOutlineMenuBook } from 'react-icons/md';
import { FaCogs,FaHome } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <BottomBarContainer>
      <MenuItem onClick={() => navigate('/home')}>
        <IconWrapper $isActive={location.pathname === '/home'}>
          <FaHome />
        </IconWrapper>
        <ItemText>Home</ItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate('/dashboard')}>
        <IconWrapper $isActive={location.pathname === '/dashboard'}>
          <MdOutlineDashboard />
        </IconWrapper>
        <ItemText>Dashboard</ItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate('/growbook')}>
        <IconWrapper $isActive={location.pathname === '/growbook'}>
          <MdOutlineMenuBook />
        </IconWrapper>
        <ItemText>GrowBook</ItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate('/settings')}>
        <IconWrapper $isActive={location.pathname === '/settings'}>
          <FaCogs />
        </IconWrapper>
        <ItemText>Settings</ItemText>
      </MenuItem>
    </BottomBarContainer>
  );
};

export default BottomBar;

const BottomBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  margin-top: auto;
  width: 100vw;
  height: 6.5vh;
  background: var(--main-bg-nav-color);
  box-shadow: var(--main-shadow-art);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;

    @media (max-width: 480px) {
        transition: color 0.3s ease;
    }

    @media (max-width: 768px) {
      height: 10vh;
        transition: color 0.3s ease;
    }

    @media (max-width: 1024px) {
        transition: color 0.3s ease;
    }
`;

const IconWrapper = styled.div`
  font-size: 1.8rem;
  color: ${({ $isActive }) => ($isActive ? 'var(--primary-accent)' : 'var(--main-text-color)')};
  transition: color 0.3s ease;
`;

const ItemText = styled.span`
  font-size: 0.75rem;
  color: var(--main-text-color);
  transition: color 0.3s ease;
`;

const MenuItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover ${IconWrapper},
  &:hover ${ItemText} {
    color: var(--primary-accent);
  }
`;