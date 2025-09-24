import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const StrainSelect = () => {
  const { entities, connection, currentRoom } = useHomeAssistant();

  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('');

  const strainEntityId = currentRoom ? `text.ogb_strainname_${currentRoom.toLowerCase()}` : null;
  const strainEntity = strainEntityId ? entities[strainEntityId] : null;

  useEffect(() => {
    if (strainEntity) {
      setInputText(strainEntity.state || '');
    }
  }, [strainEntity]);

  const updateStrainName = async (e) => {
    e.preventDefault();
    try {
      await connection.sendMessagePromise({
        type: 'call_service',
        domain: 'opengrowbox',
        service: 'update_text',
        service_data: {
          entity_id: strainEntityId,
          text: inputText,
        },
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  if (!currentRoom) return <Wrapper>🏠 Kein Raum ausgewählt</Wrapper>;
  if (!strainEntity) return <Wrapper>⚠️ Entität nicht gefunden</Wrapper>;

  return (
    <Wrapper>
      <Title>🌱 {currentRoom} : Current Strain</Title>
      
      <form onSubmit={updateStrainName}>
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Strain eingeben..."
        />
        <Button type="submit">Speichern</Button>
      </form>

      {status && (
        <Status success={status === 'success'}>
          {status === 'success' ? '✓ Gespeichert' : '✗ Fehler'}
        </Status>
      )}
    </Wrapper>
  );
};

export default StrainSelect;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Wrapper = styled.div`
  background: var(--main-bg-card-color);
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 320px;
  margin: 1rem auto;
  box-shadow: var(--main-shadow-art);
  border: 1px solid rgba(255,255,255,0.1);
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--main-text-color);
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--main-bg-Innercard-color);
  border: 1px solid var(--primary-accent);
  color: var(--main-text-color);
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-button-color);
  color: var(--main-text-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: var(--main-hover-color);
  }
`;

const Status = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  border-radius: 6px;
  animation: ${fadeIn} 0.3s ease;
  background: ${props => props.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.success ? '#22c55e' : '#ef4444'};
`;