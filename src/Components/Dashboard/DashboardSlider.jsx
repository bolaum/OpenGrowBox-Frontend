import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LiaPlayCircle, LiaPauseCircle } from "react-icons/lia";
import { motion } from "framer-motion";  // Importiere Framer Motion

import CO2Card from '../Cards/SliderCards/CO2Card';
import TempCard from '../Cards/SliderCards/TempCard'
import HumCard from '../Cards/SliderCards/HumCard'
import DewCard from '../Cards/SliderCards/DewCard'

import ECCard from '../Cards/SliderCards/ECCard'
import PHCard from '../Cards/SliderCards/PHCard';

import VPDCard from '../Cards/SliderCards/VPDCard'
import DutyCycleCard from '../Cards/SliderCards/DutyCycleCard'

const DashboardSlider = () => {
  const slides = [
    <SlideContent key="slide1">
      <CO2Card/>
    </SlideContent>,
    <SlideContent key="slide2">
        <VPDCard/>
      </SlideContent>,
    <SlideContent key="slide3">
      <TempCard/>
    </SlideContent>,
    <SlideContent key="slide4">
      <HumCard/>
    </SlideContent>,
    <SlideContent key="slide5">
      <DewCard/>
    </SlideContent>,
    <SlideContent key="slide6">
      <ECCard/>
    </SlideContent>,
    <SlideContent key="slide7">
      <PHCard/>
    </SlideContent>,
    <SlideContent key="slide7">
    <DutyCycleCard/>
  </SlideContent>,

  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 20000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <SliderContainer>
      <SliderMenu>
        <IconWrapper $active={isPlaying} onClick={handlePlay}>
          <LiaPlayCircle />
        </IconWrapper>
        <IconWrapper $active={!isPlaying} onClick={handlePause}>
          <LiaPauseCircle />
        </IconWrapper>
      </SliderMenu>

      <ArrowContainer>
        <ArrowButton onClick={handlePrev}>&#10094;</ArrowButton>
        <ArrowButton onClick={handleNext}>&#10095;</ArrowButton>
      </ArrowContainer>

      {/* Framer Motion Slide Animation */}
      <SlideWrapper
        as={motion.div}
        key={currentIndex}  // Damit die Animation bei Indexwechsel erneut ausgeführt wird
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slides[currentIndex]}
      </SlideWrapper>
    </SliderContainer>
  );
};

export default DashboardSlider;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: 25px;
  background:  var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);

`;

const SliderMenu = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 1rem;
  width: 50%;
  font-size: 0.8rem;
  border-radius: 20px;
  box-shadow: var(--main-shadow-art);
`;

const SlideWrapper = styled.div`
  display: flex;
  padding: 0.5rem;
  min-width: 95%;
  min-height: 10vh;
  max-height: 30vh;

`;

const ArrowContainer = styled.div`
  display: flex;
  justify-content: space-around;
  min-width: 25%;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--main-text-color);
  cursor: pointer;
  padding: 0.25rem 0.25rem;

  transition: color 0.3s ease;

  &:hover {
    color:var(--secondary-hover-color)
  }
`;

const SlideContent = styled.div`
  width: 100%;
  padding-bottom:1rem;
`;

const IconWrapper = styled.div`
  display: flex;
  font-size: 1.45rem;
  color: ${(props) => (props.$active ? "var(--primary-button-color)" : "#fff")};
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
