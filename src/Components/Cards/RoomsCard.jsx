import React from 'react';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const RoomsCard = ({ areas }) => {
  const { currentRoom } = useHomeAssistant();

  // Verdoppelt das Array, um einen nahtlosen Übergang zu erreichen
  const duplicatedAreas = areas.concat(areas);

  return (
    <Container>
      <TextContent>
        <CurrentRoom>
          Selected Room: <Room>{currentRoom}</Room>
        </CurrentRoom>
        <ScrollingContainer>
          <ScrollingList
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
          >
            {duplicatedAreas.map((area, index) => (
              <RoomItem key={index}>{area}</RoomItem>
            ))}
          </ScrollingList>
        </ScrollingContainer>
      </TextContent>
    </Container>
  );
};

export default RoomsCard;

const Container = styled.div`
  color:var(--main-text-color);
  overflow: hidden;
  font-size: 0.75rem;
  border: 1px solid rgba(125, 125, 125, 0.5);
  border-radius:20px;
  min-height:3rem;
  box-shadow: var(--main-shadow-art);
  background: var(--main-bg-card-color);
`;

const TextContent = styled.div`
  display: flex;
  align-items: center; /* Zentriert den Inhalt vertikal */

  padding:0.15rem;
`;

const CurrentRoom = styled.div`
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction: column;

  padding: 0.25rem;
  min-width: 38%;
  box-shadow: var(--main-shadow-art);
`;

const ScrollingContainer = styled.div`
  overflow: hidden;
  width: 100%;

`;

const ScrollingList = styled(motion.div)`
  display: flex;
  align-items: center;
  width: 200%; /* Damit der doppelte Inhalt richtig dargestellt wird */
`;

const RoomItem = styled.div`

  flex: 0 0 auto;
  box-shadow: var(--main-shadow-art);
  margin-right: 1rem;
`;

const Room = styled.div`
  width: 100%;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:1rem;
  margin-top: 0.5rem;
  font-weight: bold;
  color:var(--primary-accent);

`;
