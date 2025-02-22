import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useHomeAssistant } from '../Context/HomeAssistantContext';
import StatCard from '../Cards/StatCard';


const DashboardStats = () => {
  const { entities,currentRoom, connection } = useHomeAssistant();
  const [roomSensors, setRoomSensors] = useState([]);

  // Funktion zur Umformatierung des Labels
  const formatLabel = (label) => {
    return label
      .replace(/^OGB_AVG/, '') // Entferne "OGB_
      .replace(/^OGB_Current/, '') // Entferne "OGB_"
      .replace(/_/g, ' ') // Ersetze Unterstriche mit Leerzeichen
      .replace(new RegExp(`${currentRoom}$`, 'i'), '') // Entferne "currentRoom" dynamisch, wenn es am Ende steht
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Leerzeichen bei CamelCase
      .toLowerCase() // Kleinschreibung
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Großbuchstaben am Wortanfang
  };

  const updateRoomSensors = () => {
    const sensors = Object.entries(entities)
      .filter(([key, entity]) =>
        key.startsWith('sensor.') &&
        (key.toLowerCase().includes('ogb_avg') || 
         key.toLowerCase().includes('ogb_currentvpd')) && 
        key.toLowerCase().includes(currentRoom.toLowerCase()) && 
        !isNaN(parseFloat(entity.state))
      )
      .map(([key, entity]) => ({
        id: key,
        value: parseFloat(entity.state),
        unit: entity.attributes?.unit_of_measurement || '',
        friendlyName: formatLabel(entity.attributes?.friendly_name || key),
      }))
      // Sortiere in umgekehrter alphabetischer Reihenfolge basierend auf dem friendlyName
      .sort((a, b) => b.friendlyName.localeCompare(a.friendlyName));
  
    setRoomSensors(sensors);
  };
  
  
  

  useEffect(() => {
    updateRoomSensors();

    if (connection) {
      const handleStateChange = (event) => {
        const data = JSON.parse(event.data);
        if (
          data.type === 'state_changed' &&
          data.entity_id.startsWith('sensor.') &&
          data.entity_id.toLowerCase().includes('ogb_avg')
        ) {
          updateRoomSensors();
        }
      };

      connection.addEventListener('message', handleStateChange);
      return () => connection.removeEventListener('message', handleStateChange);
    }
  }, [entities, connection]);

  return (
    <StatsContainer>
      {roomSensors.length > 0 ? (
        roomSensors.map((sensor,index) => (
          <StatCard key={index} title={sensor.friendlyName} value={sensor.value} unit={sensor.unit}/>
        ))
      ) : (
        <p>NO Sensors Found !!!!</p>
      )}
    </StatsContainer>
  );
};

export default DashboardStats;

// Styled Components
const StatsContainer = styled.div`
  display: flex;
  flex-direction: row;  

  justify-content:space-around;
  align-items:center;
  height: auto;
  padding: 0.5rem;

  color: var(--main-text-color);
  background:  var(--main-bg-card-color);

  box-shadow: var(--main-shadow-art);
  border-radius: 25px;
  p{
    color:red;
    font-size:0.8rem;
  }

  `;

