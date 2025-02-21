import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGlobalState } from '../Context/GlobalContext';
import { useNavigate } from 'react-router-dom';
// Definiere deine Themes mit den entsprechenden CSS-Variablen


const SettingsPanel = () => {
  const { state, setDeep } = useGlobalState();
  const currentTheme = state.Design.theme;
  const availableThemes = state.Design.availableThemes;

  // Funktion, um das Theme anzuwenden, indem CSS-Variablen gesetzt werden
  const navigate = useNavigate();
  
  // Beim ersten Rendern und bei Theme-Änderungen anwenden
  useEffect(() => {

  }, [currentTheme]);
  

  const clearToken = () => {
    localStorage.removeItem("haToken")
    setDeep('Conf.haToken',null);
    navigate('/')
  }

  const clearAppStates = () => {
    localStorage.removeItem("globalState")
    localStorage.removeItem("globalOGBState")
    setDeep('Conf.haToken',null);
    navigate('/')
  }

  const ChangeTheme = (themeName) => {
    setDeep('Design.theme', themeName)
    window.location.reload();
  }
  
  return (
    <MainContainer>
      <Title>Color Theme 🎨</Title>
      <ThemeList>
        {availableThemes.map((themeName) => (
          <ThemeButton
            key={themeName}
            onClick={() => ChangeTheme(themeName)}
            selected={currentTheme === themeName}
          >
            {themeName}
          </ThemeButton>
        ))}
      </ThemeList>
      {/* Weitere Einstellungen (z.B. Mobile Notification) können hier folgen */}
      <MenuControl>

        <Title>Clear Token</Title>
        <MenuItem onClick={clearToken}>🗑️ Clear Token</MenuItem>
        <MenuItem onClick={clearAppStates}>🗑️ Clear Global State</MenuItem>
      </MenuControl>
    </MainContainer>
  );
};

export default SettingsPanel;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  height: 85vh;
  padding: 1rem;
  border-radius: 25px;
  background: var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
`;

const Title = styled.h4`
  color: var(--main-text-color);
`;

const ThemeList = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ThemeButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 25px;
  background: ${({ selected }) =>
    selected ? 'var(--primary-accent)' : 'var(--main-bg-card-color)'};
  color: var(--main-text-color);
  cursor: pointer;
  box-shadow: var(--main-shadow-art);
  transition: background 0.3s;

  &:hover {
    opacity: 0.8;
    background:var(--primary-accent);
  }
`;

const MenuControl = styled.div`
  margin-top: 1rem;
  /* Weitere Styles für zusätzliche Controls */
`;
const MenuItem = styled.button`
  padding: 8px 16px;
  color: var(--main-text-color);
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  border-radius: 25px;
  background:  var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
  &:hover {
    background-color: var(--primary-button-color);
  }
`;
