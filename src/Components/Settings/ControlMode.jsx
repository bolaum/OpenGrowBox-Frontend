import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const ControlMode = ({ coordinator, onSelectChange }) => {
  const { roomOptions, connection } = useHomeAssistant();
  const controlOptions = ["HomeAssistant", "Node-RED", "N8N", "Self-Hosted"];

  const [selectedRoom, setSelectedRoom] = useState('');
  const [controlMapping, setControlMapping] = useState(null);

  // useRef, um festzuhalten, ob die Initialisierung bereits stattgefunden hat
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!roomOptions || roomOptions.length === 0 || initializedRef.current) return;

    initializedRef.current = true; // Initialisierung erfolgt nur einmal

    const storedMappingStr = localStorage.getItem("controlMapping");
    let storedMapping = {};
    try {
      storedMapping = storedMappingStr ? JSON.parse(storedMappingStr) : {};
    } catch (e) {
      console.error("Fehler beim Parsen des gespeicherten Mappings:", e);
    }
    // Erstelle das Mapping für alle Räume: wenn es einen gespeicherten Wert gibt, verwende ihn; sonst den Standardwert.
    const newMapping = {};
    roomOptions.forEach(room => {
      newMapping[room] = storedMapping[room] || controlOptions[0];
    });
    setControlMapping(newMapping);
    setSelectedRoom(roomOptions[0]);
  }, [roomOptions]);

  // Speichere das Mapping im localStorage, sobald es sich ändert
  useEffect(() => {
    if (controlMapping !== null) {
      localStorage.setItem("controlMapping", JSON.stringify(controlMapping));
    }
  }, [controlMapping]);

  if (controlMapping === null) {
    return <div>Laden...</div>;
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (onSelectChange && controlMapping[room]) {
      onSelectChange(room, controlMapping[room]);
    }
  };

  const handleControlSelect = (option) => {
    setControlMapping(prevMapping => {
      const newMapping = { ...prevMapping, [selectedRoom]: option };
      if (onSelectChange) {
        onSelectChange(selectedRoom, option);
      }
      handleModeChange(selectedRoom, option);
      return newMapping;
    });
  };

  const handleModeChange = async (room, newValue) => {
    const entityPrefix = "ogb_maincontrol_";
    // Entity-ID im Format "select.ogb_maincontrol_<raumname>" erzeugen:
    const entity_id = `select.${entityPrefix}${room.toLowerCase()}`;
    console.log("Entity ID:", entity_id);
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'select',
          service: 'select_option',
          service_data: {
            entity_id: entity_id,
            option: newValue,
          },
        });
      } catch (error) {
        console.error('Error updating entity:', error);
      }
    } else {
      console.log("Keine Verbindung vorhanden.");
    }
  };

  return (
    <Container>
      <SectionTitle>Room-Controller</SectionTitle>
      <TagsContainer>
        {roomOptions.map((room) => (
          <Tag
            key={room}
            selected={room === selectedRoom}
            onClick={() => handleRoomSelect(room)}
          >
            {room}
          </Tag>
        ))}
      </TagsContainer>
      <InfoTitle>Control Options für {selectedRoom}</InfoTitle>
      <TagsContainer>
        {controlOptions.map((option) => (
          <Tag
            key={option}
            selected={controlMapping[selectedRoom] === option}
            onClick={() => handleControlSelect(option)}
          >
            {option}
          </Tag>
        ))}
      </TagsContainer>
    </Container>
  );
};

export default ControlMode;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h4`
  margin: 0;
  color: var(--main-text-color);
`;

const InfoTitle = styled.h5`
  margin: 0;
  color: var(--main-text-color);
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  background: ${({ selected }) =>
    selected ? 'var(--primary-accent)' : 'var(--main-bg-card-color)'};
  color: var(--main-text-color);
  box-shadow: var(--main-shadow-art);
  transition: background 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;
