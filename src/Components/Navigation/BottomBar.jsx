import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MdOutlineDashboard, MdOutlineMenuBook } from 'react-icons/md';
import { FaCogs, FaHome, FaCrown, FaCannabis } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import { usePremium } from '../Context/OGBPremiumContext';

const BottomBar = () => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/home', icon: FaHome, label: 'Home' },
    { path: '/dashboard', icon: MdOutlineDashboard, label: 'Dashboard' },
    ...(isPremium ? [{ path: '/premium', icon: FaCrown, label: 'Premium' }] : []),
    ...(isPremium ? [{ path: '/strainDB', icon: FaCannabis, label: 'StrainDB' }] : []),
    { path: '/growbook', icon: MdOutlineMenuBook, label: 'GrowBook' },
    { path: '/settings', icon: FaCogs, label: 'Settings' }
  ];

  return (
    <BottomBarContainer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <BackgroundBlur />
      <ContentWrapper $itemCount={menuItems.length}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <MenuItem
              key={item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              $itemCount={menuItems.length}
            >
              <IconContainer $isActive={isActive}>
                <IconBackground 
                  $isActive={isActive}
                  animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <IconWrapper $isActive={isActive}>
                  <IconComponent />
                </IconWrapper>
              </IconContainer>
              <ItemText 
                $isActive={isActive}
                animate={{ 
                  opacity: isActive ? 1 : 0.7,
                  y: isActive ? -2 : 0
                }}
                transition={{ duration: 0.2 }}
                $itemCount={menuItems.length}
              >
                {item.label}
              </ItemText>
            </MenuItem>
          );
        })}
      </ContentWrapper>
    </BottomBarContainer>
  );
};

export default BottomBar;

const BottomBarContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 85px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg, 
      transparent, 
      var(--primary-accent, #007AFF) 20%, 
      var(--primary-accent, #007AFF) 80%, 
      transparent
    );
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    height: 83px;
    padding-bottom: max(env(safe-area-inset-bottom), 8px);
  }

  @media (max-width: 480px) {
    height: 78px;
    padding-bottom: max(env(safe-area-inset-bottom), 8px);
  }
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
`;

const ContentWrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${({ $itemCount }) => $itemCount > 5 ? '8px 8px' : '8px 16px'};
  max-width: ${({ $itemCount }) => $itemCount > 5 ? '100%' : '600px'};
  margin: 0 auto;
  gap: ${({ $itemCount }) => $itemCount > 5 ? '4px' : '8px'};

  @media (max-width: 768px) {
    padding: ${({ $itemCount }) => $itemCount > 5 ? '6px 4px 14px' : '6px 12px 14px'};
    gap: ${({ $itemCount }) => $itemCount > 5 ? '2px' : '6px'};
    align-items: flex-start;
    padding-top: 8px;
  }

  @media (max-width: 480px) {
    padding: ${({ $itemCount }) => $itemCount > 5 ? '4px 2px 16px' : '4px 8px 16px'};
    gap: ${({ $itemCount }) => $itemCount > 5 ? '1px' : '4px'};
    align-items: flex-start;
    padding-top: 6px;
  }
`;

const MenuItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: ${({ $itemCount }) => $itemCount > 5 ? '6px 4px' : '8px 12px'};
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  max-width: ${({ $itemCount }) => $itemCount > 5 ? '80px' : '100px'};

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: ${({ $itemCount }) => $itemCount > 5 ? '4px 2px' : '6px 8px'};
    max-width: ${({ $itemCount }) => $itemCount > 5 ? '70px' : '90px'};
  }

  @media (max-width: 480px) {
    padding: ${({ $itemCount }) => $itemCount > 5 ? '3px 1px' : '4px 6px'};
    max-width: ${({ $itemCount }) => $itemCount > 5 ? '60px' : '80px'};
  }
`;

const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin-bottom: 3px;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    margin-bottom: 2px;
  }
`;

const IconBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: ${({ $isActive }) => 
    $isActive 
      ? 'linear-gradient(135deg, var(--primary-accent, #007AFF) 0%, var(--primary-accent, #007AFF) 100%)'
      : 'transparent'
  };
  opacity: ${({ $isActive }) => $isActive ? 0.15 : 0};
  transition: all 0.3s ease;
`;

const IconWrapper = styled(motion.div)`
  font-size: 24px;
  color: ${({ $isActive }) => 
    $isActive 
      ? 'var(--primary-accent, #007AFF)' 
      : 'var(--main-text-color, #666)'
  };
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0 0 8px rgba(0, 122, 255, 0.3))' : 'none'};

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ItemText = styled(motion.span)`
  font-size: ${({ $itemCount }) => $itemCount > 5 ? '9px' : '11px'};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  color: ${({ $isActive }) => 
    $isActive 
      ? 'var(--primary-accent, #007AFF)' 
      : 'var(--main-text-color, #666)'
  };
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: ${({ $itemCount }) => $itemCount > 5 ? '8px' : '10px'};
  }

  @media (max-width: 480px) {
    font-size: ${({ $itemCount }) => $itemCount > 5 ? '7px' : '9px'};
    letter-spacing: 0.3px;
  }
`;