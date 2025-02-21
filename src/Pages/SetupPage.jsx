import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCannabis } from 'react-icons/fa';
import { useGlobalState } from '../Components/Context/GlobalContext';

import { useNavigate } from 'react-router-dom';


const GradientDefs = () => (
  <svg width="0" height="0">
    <defs>
      <linearGradient id="autumnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffa500', stopOpacity: 1 }} />
        <stop offset="25%" style={{ stopColor: '#ff6347', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#ff4500', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fff000', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

const SetupPage = () => {
  const [inputToken, setInputToken] = useState('');
  const {setDeep} = useGlobalState(); // Zugriff auf die saveToken-Methode
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    setInputToken(e.target.value);
  };

  const isValidJWT = (token) => {
    if (!token) return false;
    
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return jwtPattern.test(token);
  };
  
  const handleSubmit = () => {
    if (!inputToken) {
      alert('Please enter your token!');
      return;
    }
  
    if (!isValidJWT(inputToken)) {
      alert('Invalid token format! Please enter a valid Token.');
      return;
    }
  
    if (import.meta.env.PROD) {
      setDeep('Conf.haToken', inputToken);
    } else {
      //localStorage.setItem('haDevToken', inputToken);
      setDeep('Conf.haToken', inputToken);
      localStorage.setItem('haDevToken',inputToken)
    }
  
    navigate("/home");
  };
  
  return (
    <Wrapper>
      <GradientDefs />
      <Header>
        <CannabisIcon />
        Welcome to OpenGrowBox
      </Header>
      <SubText>
        Please enter your Home Assistant Long-Lived Access Token to proceed.
      </SubText>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Enter API Token..."
          value={inputToken}
          onChange={handleInputChange}
        />
        <SubmitButton onClick={handleSubmit}>Save Token</SubmitButton>
      </InputWrapper>
      <Footer>
        🪴 Grow smarter with OpenGrowBox! <CannabisIconHarvest /> Harvest Better
      </Footer>
    </Wrapper>
  );
};

export default SetupPage;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  width:100vw;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--main-bg-color);
  color: var(--main-text-color);
  animation: ${fadeIn} 1s ease-in-out;
  z-index: 100;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: var(--primary-accent);
  text-shadow: 0px 0px 10px var(--primary-accent);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SubText = styled.p`
  font-size: 1rem;
  color:  var(--main-text-color);
  margin-bottom: 2rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid var(--primary-accent);
  background: #333;
  color: var(--main-text-color);
  outline: none;
  box-shadow: 0px 0px 10px var(--main-hover-color);

  &:focus {
    border-color: var(--primary-accent);
    box-shadow: 0px 0px 15px var(--primary-accent);
  }
`;

const SubmitButton = styled.button`
  background: var(--primary-accent);
  color: var(--main-bg-color);
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  box-shadow: varf(--main-shadow-art);

  &:hover {
    background: var(--primary-accent);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Footer = styled.div`
  margin-top: 2rem;
  font-size: 0.9rem;
  color:var(--secondary-button-color);
`;

const CannabisIcon = styled(FaCannabis)`
  font-size: 2rem;
  color: var(--primary-accent);
  animation: ${fadeIn} 1.5s ease-in-out infinite alternate;
`;

const CannabisIconHarvest = styled(FaCannabis)`
  font-size: 1.8rem;
  fill: url(#autumnGradient);
`;