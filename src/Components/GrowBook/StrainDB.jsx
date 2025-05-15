import React from 'react'
import styled from 'styled-components';
import { motion } from 'framer-motion';


const StrainDB = () => {
  return (
    <>
    <MotionContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      ></MotionContainer>
          <CounterCard>
            <CardHeader>StrainDB is comming soon ... Wait for it!</CardHeader>
          </CounterCard>
    </>

  )
}

export default StrainDB

const MotionContainer = motion(styled.div``);

const CounterCard = styled.div`
  background: var(--main-bg-card-color);
  border-radius: 16px;
  padding: 0.7rem;
  max-width: 22rem;
  min-height:10rem;
  margin: 0.5rem auto;
  box-shadow: var(--main-shadow-art);
  color: var(--main-text-color);
  font-family: 'Arial', sans-serif;
`;

const CardHeader = styled.div`
  border-bottom: 2px solid var(--primary-accent);
  padding-bottom: 0.25rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;
