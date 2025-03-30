import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaTelegram } from 'react-icons/fa';

const SettingsFooter = () => {
  const currentYear = new Date().getFullYear();
  const [appVersion, setAppVersion] = useState('Laden...');
  const [hasUpdate, setHasUpdate] = useState(false);




  useEffect(() => {
    const currentVersion = "1.0.4";
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/OpenGrow-Box/OpenGrowBox-Frontend/releases/latest');
        const data = await response.json();
        // Prüfe, ob data.tag_name existiert und die Version abweicht
        if (data.tag_name && currentVersion !== data.tag_name) {
          setHasUpdate(true);
          setAppVersion(data.tag_name);
        } else {
          setAppVersion(currentVersion);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der neuesten Version:', error);
        setAppVersion('Unbekannt');
      }
    };

    fetchLatestRelease();
  }, []);

  const handleVersionClick = () => {
    window.open('https://github.com/OpenGrow-Box/OpenGrowBox-Frontend/releases/latest', '_blank');
  };

  const handleWikiClick = () => {
    window.open('https://github.com/OpenGrow-Box/OpenGrowBox/wiki', '_blank');
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/+I1P3XoSSbbtkZjUy', '_blank');
  };

  const checkVersion = (data,currentVersion) => {
    console.log(data.tag_name)

    if(currentVersion !== data.tag_name){
      hasUpdate(true)
      setAppVersion(data.tag_name); // Setze die Versionsnummer
    }
  }

  return (
    <FooterContainer>
      <Copyright>© {currentYear} OpenGrowBox</Copyright>
      <About onClick={handleWikiClick}>Wiki</About>
      <TelegramButton onClick={handleTelegramClick}>
        <FaTelegram size={18} /> Join Telegram
      </TelegramButton>
      <Version onClick={handleVersionClick}>
        {hasUpdate ? '🚀 New Update! UI Version: ' : 'UI Version: '}{appVersion}
      </Version>
    </FooterContainer>
  );
};

export default SettingsFooter;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color:var(--main-text-color);
`;

const Copyright = styled.div`
  font-size: 0.7rem;
`;

const About = styled.div`
  font-size: 0.7rem;
  padding: 0.1rem;
  cursor: pointer;
  text-decoration: underline;
`;

const Version = styled.div`
  font-size: 0.7rem;
  padding: 0.1rem;
  border-bottom: 1px solid var(--main-text-color);
  cursor: pointer;
  color: ${props => (props.hasUpdate ? 'red' : 'inherit')};
  ${props => props.hasUpdate && `animation: ${blink} 1s infinite;`}
  
  &:hover {
    font-weight: bold;
    background: ${props => (props.hasUpdate ? 'yellow' : 'inherit')};
    border-radius: 5px;
    padding: 0.2rem;
  }
`;


const TelegramButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.3remx;
  font-size: 0.8rem;
  border: none;
  border-radius: 25px;
  background-color: #0088cc;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #0077b5;
  }
`;
