import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import { usePremium } from '../Context/OGBPremiumContext';




// --- COMPONENT ---
const GrowBenchmark = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { entities, currentRoom } = useHomeAssistant();
  const [strainName, setStrainName] = useState();
  const [growPlanName, setgrowPlanName] = useState(`${strainName} Plan`);
  const [isOpen, setIsOpen] = useState(false);
  const { sendGrowPlan } = usePremium();
  const roomKey = useMemo(() => currentRoom.toLowerCase(), [currentRoom]);

  useEffect(() => {
    const strainSensor = entities[`text.ogb_strainname_${roomKey}`];
    if (strainSensor) {
      setStrainName(strainSensor.state);
    }
  }, [entities, roomKey]);

  const title = useMemo(() => `${strainName || 'Unnamed'} - Grow Benchmark`, [strainName]);

  const handleGrowEnd = async () => {
      console.log("SEND END REQUEST ")
  }

  return (
    <>
      <Container $isOpen={isOpen}>
        <Header onClick={() => setIsOpen((prev) => !prev)}>
          <TitleSection>
            <Title>{title}</Title>
            <Subtitle>Rate your Grows</Subtitle>
          </TitleSection>
          <ToggleIcon $isOpen={isOpen}>
            <ChevronIcon />
          </ToggleIcon>
        </Header>

        {isOpen && (
          <>
            <div>
              End your Grow 
              <button onClick={() => handleGrowEnd()} />

            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default GrowBenchmark;


// --- STYLED COMPONENTS ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 780px;
  min-width: 320px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(145deg, #0f0f23, #1a1a3a);
  border-radius: 16px;
  border: 1px solid rgba(56, 189, 248, 0.1);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(56, 189, 248, 0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #f1f5f9;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 24px;
    width: 70%;
    max-width: 1200px;
  }
  
  @media (min-width: 1024px) {
    width: 90%;
    max-width: 900px;;
  }
  
  ${({ $isOpen }) => `
    max-height: ${$isOpen ? 'none' : '6rem'};
    overflow: ${$isOpen ? 'visible' : 'hidden'};
  `}
  
  @media (min-width: 768px) {
    ${({ $isOpen }) => `
      max-height: ${$isOpen ? '90vh' : '7rem'};
    `}
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(56, 189, 248, 0.2);
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-bottom-color: rgba(56, 189, 248, 0.4);
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ToggleIcon = styled.span`
  font-size: 1.25rem;
  transition: transform 0.3s ease;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
  
  ${({ $isOpen }) => $isOpen && `
    transform: rotate(180deg);
  `}
`;

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);
