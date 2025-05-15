import React, { useState } from 'react';
import styled from 'styled-components';

import { MdLightMode,MdOutlineCo2, MdDeviceHub} from "react-icons/md";
import { FaCannabis } from "react-icons/fa";
import { ImTarget } from "react-icons/im";
import { PiDiamondsFourBold } from "react-icons/pi";
import ControllCollection from './ControlCards/ControllCollection';
import { GiWateringCan } from "react-icons/gi";
const ControllCard = () => {
  const [currentOption, setCurrentOption] = useState("Main Control");

  const handleOnClickIcon = (type) => {
    setCurrentOption(type);
  };

  return (
    <>
      <OptionContainer>
        <IconWrapper $active={currentOption === "Main Control"} onClick={() => handleOnClickIcon("Main Control")}>
          <FaCannabis />
        </IconWrapper>
        <IconWrapper $active={currentOption === "Lights"} onClick={() => handleOnClickIcon("Lights")}>
          <MdLightMode />
        </IconWrapper>
        <IconWrapper $active={currentOption === "CO₂ Control"} onClick={() => handleOnClickIcon("CO₂ Control")}>
          <MdOutlineCo2 />
        </IconWrapper>
        <IconWrapper $active={currentOption === "Targets"} onClick={() => handleOnClickIcon("Targets")}>
          <ImTarget />
        </IconWrapper>
        <IconWrapper $active={currentOption === "Hydro Settings"} onClick={() => handleOnClickIcon("Hydro Settings")}>
          <GiWateringCan />
        </IconWrapper>

          {/***
           *         <IconWrapper $active={currentOption === "P.I.D"} onClick={() => handleOnClickIcon("P.I.D")}>
          <PiDiamondsFourBold />
        </IconWrapper>

        <IconWrapper $active={currentOption === "Device Settings"} onClick={() => handleOnClickIcon("Device Settings")}>
          <MdDeviceHub />
        </IconWrapper>
           * 
           * ***/}

      </OptionContainer>
      <SelectContainer>
        <ControllCollection option={currentOption} />
      </SelectContainer>
    </>
  );
};

export default ControllCard;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;

  width: 90%;
  min-height: 5vh;
  font-size: 1.4rem;
  border-radius:20px;
  box-shadow: var(--main-shadow-art);
`;

const SelectContainer = styled.div`
  width: 95%;
  height: 100%;
`;

const IconWrapper = styled.div`
  display: flex;
  font-size: 1.45rem;
  color: ${(props) => (props.$active ? "var(--primary-button-color)" : "var(--main-text-color)")};
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: var(--secondary-hover-color);
  }

  @media (max-width: 1024px) {
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;
