import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const ControlMode = ({ coordinator, onSelectChange }) => {
  const { roomOptions, connection, entities } = useHomeAssistant();
  const controlOptions = ["HomeAssistant", "Node-RED", "N8N", "Self-Hosted"];
  const notificationOptions = ["Enabled", "Disabled"];

  const [selectedRoom, setSelectedRoom] = useState('');
  const [controlMapping, setControlMapping] = useState(null);
  const [notificationMapping, setNotificationMapping] = useState(null);
  const [controlSensors, setControlSensors] = useState({});
  const [notificationSensors, setNotificationSensors] = useState({});
  const initializedRef = useRef(false);

  // Erfasse Select-Entities und spiegle sie in Mapping
  useEffect(() => {
    const newControl = {};
    const newNotification = {};

    Object.entries(entities).forEach(([key, entity]) => {
      const match = key.match(/^select\.ogb_(?:lightcontrol|maincontrol|notifications)_(.+)$/);
      if (!match) return;
      const type = key.includes('maincontrol') || key.includes('lightcontrol') ? 'control' : 'notifications';
      const roomKey = match[1];
      const room = roomOptions?.find(r => r.toLowerCase() === roomKey);
      if (!room) return;

      if (type === 'control') {
        newControl[room] = entity.state;
      } else {
        newNotification[room] = entity.state;
      }
    });

    setControlSensors(newControl);
    setNotificationSensors(newNotification);

    // Update UI-Mapping nur, wenn initialisiert
    if (controlMapping && notificationMapping) {
      setControlMapping(prev => {
        const updated = { ...prev };
        Object.entries(newControl).forEach(([room, state]) => {
          if (updated[room] !== state) updated[room] = state;
        });
        return updated;
      });
      setNotificationMapping(prev => {
        const updated = { ...prev };
        Object.entries(newNotification).forEach(([room, state]) => {
          if (updated[room] !== state) updated[room] = state;
        });
        return updated;
      });

      // Optional: callback
      if (onSelectChange && selectedRoom) {
        onSelectChange(
          selectedRoom,
          newControl[selectedRoom] || controlMapping[selectedRoom],
          newNotification[selectedRoom] || notificationMapping[selectedRoom]
        );
      }
    }
  }, [entities, roomOptions]);

  // Initialisiere aus localStorage
  useEffect(() => {
    if (!roomOptions?.length || initializedRef.current) return;
    initializedRef.current = true;

    const storedControl = JSON.parse(localStorage.getItem('controlMapping') || '{}');
    const storedNotif = JSON.parse(localStorage.getItem('notificationMapping') || '{}');

    const initControl = {};
    const initNotif = {};
    roomOptions.forEach(room => {
      initControl[room] = storedControl[room] || controlOptions[0];
      initNotif[room] = storedNotif[room] || notificationOptions[0];
    });

    setControlMapping(initControl);
    setNotificationMapping(initNotif);
    setSelectedRoom(roomOptions[0]);
  }, [roomOptions]);

  // Persist
  useEffect(() => {
    if (controlMapping) localStorage.setItem('controlMapping', JSON.stringify(controlMapping));
  }, [controlMapping]);
  useEffect(() => {
    if (notificationMapping) localStorage.setItem('notificationMapping', JSON.stringify(notificationMapping));
  }, [notificationMapping]);

  if (!controlMapping || !notificationMapping) return <div>Loading...</div>;

  const callService = async (entitySuffix, option) => {
    if (!connection) return;
    const entity_id = `select.ogb_${entitySuffix}_${selectedRoom.toLowerCase()}`;
    try {
      await connection.sendMessagePromise({
        type: 'call_service',
        domain: 'select',
        service: 'select_option',
        service_data: { entity_id, option },
      });
    } catch (err) {
      console.error('Error calling service:', err);
    }
  };

  const selectControl = option => {
    setControlMapping(prev => ({ ...prev, [selectedRoom]: option }));
    callService('maincontrol', option);
    onSelectChange?.(selectedRoom, option, notificationMapping[selectedRoom]);
  };

  const selectNotification = option => {
    setNotificationMapping(prev => ({ ...prev, [selectedRoom]: option }));
    callService('notifications', option);
    onSelectChange?.(selectedRoom, controlMapping[selectedRoom], option);
  };

  return (
    <Container>
      <SectionTitle>Room-Controller</SectionTitle>
      <TagsContainer>
        {roomOptions.map(room => (
          <Tag key={room} selected={room === selectedRoom} onClick={() => setSelectedRoom(room)}>
            {room}
          </Tag>
        ))}
      </TagsContainer>

      <InfoTitle>Control Options - {selectedRoom}</InfoTitle>
      <TagsContainer>
        {controlOptions.map(opt => (
          <Tag
            key={opt}
            selected={controlMapping[selectedRoom] === opt}
            onClick={() => selectControl(opt)}
          >{opt}</Tag>
        ))}
      </TagsContainer>

      <InfoTitle>Notifications - {selectedRoom}</InfoTitle>
      <TagsContainer>
        {notificationOptions.map(opt => (
          <Tag
            key={opt}
            selected={notificationMapping[selectedRoom] === opt}
            onClick={() => selectNotification(opt)}
          >{opt}</Tag>
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

  &:hover { opacity: 0.8; }
`;
