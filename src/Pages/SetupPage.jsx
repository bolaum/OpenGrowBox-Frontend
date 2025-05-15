import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGlobalState } from '../Components/Context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { useHomeAssistant } from '../Components/Context/HomeAssistantContext';
import isValidJWT from '../misc/isValidJWT'


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
  const { setDeep,accessToken } = useGlobalState();
  const navigate = useNavigate();
  const {connection} = useHomeAssistant();

  const handleInputChange = (e) => {
    setInputToken(e.target.value);
  };

  const handleSubmit = async () => {
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
      if(connection){
        await handleTokenChange("text.ogb_accesstoken", inputToken);
        localStorage.setItem('haToken', inputToken);
        navigate("/home");
      }else{
        alert('Invalid token! Please enter a valid Token.');
      }
    }else{
      setDeep('Conf.haToken', inputToken);
      if(connection){
        await handleTokenChange("text.ogb_accesstoken", inputToken);
        localStorage.setItem('devToken', inputToken);
        navigate("/home");
      }else{
        alert('Invalid token! Please enter a valid Token.');
      }
    }
    


  
  };
  
  const handleTokenChange = async (entity, value) => {
    console.log(entity,value)
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'opengrowbox',
          service: 'update_text',
          service_data: {
            entity_id: entity,
            text: value,
          },
        });

      } catch (error) {
        console.error('Error updating entity:', error);
      }
    }



  };

  return (
    <Wrapper>
      <GradientDefs />
      <Header>
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
        🪴 Grow smarter with OpenGrowBox! 🪴 Harvest Better
      </Footer>
    </Wrapper>
  );
};

export default SetupPage;

// === Styles ===

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
  position: relative;
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--main-bg-color);
  animation: ${fadeIn} 1s ease-in-out;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    background: url('/ogb_logo.svg') no-repeat center;
    background-size: 80%;
    filter: blur(0.05rem); /* 🎯 hier passiert der Blur */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.1;
  }
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
  color: var(--main-text-color);
  margin-bottom: 2rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.4);
  padding: 20px;
  border-radius: 12px;
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
  box-shadow: var(--main-shadow-art);

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Footer = styled.div`
  margin-top: 2rem;
  font-size: 1rem;
  color: var(--secondary-button-color);
`;
