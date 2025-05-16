import React, { useState, useEffect, useRef } from 'react';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import styled from 'styled-components';

const MAX_LENGTH = 254;

const textChange = async (entity, value, connection) => {
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

const OGBNotes = () => {
  const { entities, currentRoom, connection } = useHomeAssistant();
  const [ogbNoteEntity, setOGBNoteEntity] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [status, setStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const noteSensor = Object.entries(entities).find(
      ([key, entity]) =>
        key.startsWith('text.') &&
        key.toLowerCase().includes('notes') &&
        entity.entity_id.toLowerCase().includes(currentRoom?.toLowerCase())
    );

    if (noteSensor) {
      const [, entity] = noteSensor;
      setOGBNoteEntity(entity.entity_id);

      // Nur synchronisieren, wenn keine ungespeicherten Änderungen vorliegen
      if (!hasUnsavedChanges && entity.state !== noteText) {
        setNoteText(entity.state || '');
      }
    }
  }, [entities, currentRoom, hasUnsavedChanges]);

  const handleChange = (e) => {
    const value = e.target.value.slice(0, MAX_LENGTH);
    setNoteText(value);
    setIsTyping(true);
    setHasUnsavedChanges(true);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ogbNoteEntity || !connection) {
      setStatus('No Valid Entity Found.');
      return;
    }

    await textChange(ogbNoteEntity, noteText, connection);
    setStatus('Note Saved!');
    setHasUnsavedChanges(false); // Jetzt ist alles gespeichert
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <NotesContainer>
      <Title>{currentRoom}`s Notes</Title>
      <form onSubmit={handleSubmit}>
        <TextArea
          maxLength={MAX_LENGTH}
          value={noteText}
          onChange={handleChange}
          placeholder="Enter some Notes Here..."
        />
        <InfoText>{noteText.length}/{MAX_LENGTH} Zeichen</InfoText>
        <Button type="submit">Speichern</Button>
      </form>
      {status && <StatusText>{status}</StatusText>}
    </NotesContainer>
  );
};

export default OGBNotes;

// Styled Components
const NotesContainer = styled.div`
  padding: 0.7rem;
  border: 1px solid var(--secondary-accent);
  border-radius: 1rem;
  max-width: 22rem;
  width: 100%;
  min-height: 10rem;
  background: var(--main-bg-card-color);
  color: var(--main-text-color);
  box-shadow: var(--main-shadow-art);
  font-size: 0.95rem;
  margin: 0.5rem auto;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 10rem;
  font-size: 0.9rem;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid var(--primary-accent);
  background-color: var(--main-bg-Innercard-color);
  color: var(--main-text-color);
  resize: none;
  outline: none;

  &:focus {
    border-color: var(--secondary-accent);
    box-shadow: 0 0 0 2px var(--secondary-accent);
  }
`;

const InfoText = styled.div`
  text-align: right;
  margin-top: 0.25rem;
  color: var(--second-text-color);
  font-size: 0.8rem;
`;

const Button = styled.button`
  margin-top: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: bold;
  background-color: var(--primary-button-color);
  color: var(--main-text-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--main-hover-color);
  }
`;

const StatusText = styled.div`
  margin-top: 0.4rem;
  color: var(--main-arrow-up);
  font-size: 0.85rem;
  font-weight: 600;
`;

const Title = styled.h4`
  margin-bottom: 0.5rem;
  color: var(--main-text-color);
  font-size: 1rem;
  font-weight: 600;
`;
