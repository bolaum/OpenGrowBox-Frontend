import { useState, useEffect, useRef } from 'react';
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
  const { connection,entities,currentRoom } = useHomeAssistant();

  const [ogbNoteEntity, setOGBNoteEntity] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [status, setStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
  const noteSensor = Object.entries(entities).find(
    ([key]) =>
      key.startsWith("text.ogb_notes_") &&
      key.toLowerCase().includes(currentRoom?.toLowerCase())
  );
    console.log(noteSensor)
    if (noteSensor) {
      const [, entity] = noteSensor;
      setOGBNoteEntity(entity.entity_id);

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

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ogbNoteEntity || !connection) {
      setStatus('No Valid Entity Found.');
      return;
    }
    await textChange(ogbNoteEntity, noteText, connection);
    setStatus('Note Saved!');
    setHasUnsavedChanges(false);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <NotesContainer>
      <Header>
        <Title>{currentRoom}'s Notes</Title>
        <InfoText>{noteText.length}/{MAX_LENGTH} Chars</InfoText>
      </Header>

      <StyledForm onSubmit={handleSubmit}>
        <TextArea
          value={noteText}
          onChange={handleChange}
          placeholder="Write down your thoughts or tasks..."
        />
        <ButtonRow>
          <Button type="submit">💾 Save</Button>
          {status && <StatusText>{status}</StatusText>}
        </ButtonRow>
      </StyledForm>
    </NotesContainer>
  );
};

export default OGBNotes;

// Styled Components mit Mobile-Fixes
const NotesContainer = styled.div`
  padding: 1rem;
  border: 1px solid var(--secondary-accent);
  border-radius: 1rem;
  background: var(--main-bg-card-color);
  color: var(--main-text-color);
  box-shadow: var(--main-shadow-art);
  width: 100%;
  max-width: 28rem;
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  /* Mobile-spezifische Fixes */
  position: relative;

  box-sizing: border-box;
  
  /* Responsive Anpassungen */
  @media (max-width: 768px) {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    margin: 0.25rem;
    max-width: calc(100% - 0.5rem);
    padding: 0.5rem;
    border-radius: 0.75rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const Title = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--main-text-color);
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 12rem; /* Erhöht für Desktop */
  font-size: 0.9rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--primary-accent);
  background-color: var(--main-bg-Innercard-color);
  color: var(--main-text-color);
  resize: vertical;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    border-color: var(--secondary-accent);
    box-shadow: 0 0 0 2px var(--secondary-accent);
  }
  
  @media (max-width: 768px) {
    min-height: 10rem;
  }
  
  @media (max-width: 480px) {
    font-size: 16px; /* Verhindert Zoom auf iOS */
    min-height: 8rem;
    padding: 0.5rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: var(--primary-button-color);
  color: var(--main-text-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  touch-action: manipulation; /* Bessere Touch-Performance */

  &:hover {
    background-color: var(--main-hover-color);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
`;

const StatusText = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--main-arrow-up);
  
  @media (max-width: 480px) {
    margin-left: 0;
    text-align: center;
    font-size: 0.8rem;
  }
`;

const InfoText = styled.div`
  font-size: 0.8rem;
  color: var(--second-text-color);
  text-align: right;
  
  @media (max-width: 480px) {
    text-align: left;
    font-size: 0.75rem;
  }
`;