import { useEffect, useState } from 'react';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import styled from 'styled-components';
import formatLabel from '../../misc/formatLabel';

const GlobalOverview = () => {
  const { entities, currentRoom } = useHomeAssistant();
  const [neededSensors, setNeededSensors] = useState([]);
  const [remainingDays, setRemainingDays] = useState('');

  // Hilfsfunktion, um Minuten in Stunden und Minuten umzuwandeln
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };


  useEffect(() => {
    const roomKey = currentRoom.toLowerCase();
    if (entities[`sensor.ogb_chopchoptime_${roomKey}`]) {
      setRemainingDays(entities[`sensor.ogb_chopchoptime_${roomKey}`].state);
    }
  }, [entities, currentRoom]);

  useEffect(() => {
    const updateNeededSensors = () => {
      const sensors = Object.entries(entities)
        .filter(
          ([key, entity]) =>
            key.startsWith('number.') &&
            key.toLowerCase().includes('food') &&
            key.toLowerCase().includes(currentRoom.toLowerCase()) &&
            !key.toLowerCase().includes('wifi') &&
            !key.toLowerCase().includes('mqtt') &&
            !key.toLowerCase().includes('connect') &&
            !isNaN(parseFloat(entity.state))
        )
        .map(([key, entity]) => {
          const rawValue = parseFloat(entity.state); // Annahme: Wert in Minuten
          return {
            id: key,
            value: rawValue,
            friendlyName: formatLabel(entity.attributes?.friendly_name || key),
          };
        });
      setNeededSensors(sensors);
    };
    updateNeededSensors();
  }, [entities, currentRoom]);

  return (
    <OverViewContainer>

    <div>Harvest in : {remainingDays ? Math.floor(parseFloat(remainingDays)) : 'N/A'} Days</div>

    </OverViewContainer>
  );
};

export default GlobalOverview;

const OverViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  border-radius: 2rem;
  border: 1px solid black;
  color: var(--main-text-color);
  background: var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
`;
