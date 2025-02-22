import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

const StatCard = ({ title, value, unit }) => {
  const [direction, setDirection] = useState(null);
  const prevValueRef = useRef(Number(value)); // Speichere den initialen numerischen Wert

  useEffect(() => {
    const prevValue = prevValueRef.current;
    const currentValue = Number(value);
    
    if (currentValue > prevValue) {
      setDirection("up");
    } else if (currentValue < prevValue) {
      setDirection("down");
    } else {
      setDirection(null);
    }

    // Aktualisiere den Ref für den nächsten Vergleich
    prevValueRef.current = currentValue;
  }, [value]);

  return (
    <StatsContainer>
      <StatsTitle>{title}</StatsTitle>
      <ValueBox>
        {direction === "up" && (
          <ArrowIcon color="var(--main-arrow-up)">
            <FaArrowTrendUp />
          </ArrowIcon>
        )}
        {direction === "down" && (
          <ArrowIcon color="var(--main-arrow-down)">
            <FaArrowTrendDown />
          </ArrowIcon>
        )}
        <StatsValue>{value}</StatsValue>
        <StatsUnit>{unit}</StatsUnit>
      </ValueBox>
    </StatsContainer>
  );
};

export default StatCard;

//
// Styled Components
//
const StatsContainer = styled.div`

`;

const ValueBox = styled.div`
  display: flex;
  gap: 0.2rem;
  align-items: center;
`;

const StatsTitle = styled.div`
  display: flex;

  justify-content: flex-start;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--main-text-color);
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    transition: color 0.3s ease;
  }

  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
`;

const StatsValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--main-value-color);

  @media (max-width: 480px) {
    flex-direction: column;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    font-size: 0.89rem;
    transition: color 0.3s ease;
  }

  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
`;

const StatsUnit = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--main-unit-color);


  @media (max-width: 480px) {
    flex-direction: column;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    transition: color 0.3s ease;
  }

  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
`;

const ArrowIcon = styled.div`
  color: ${(props) => props.color || 'blue'};
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    transition: color 0.3s ease;
  }

  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
`;
