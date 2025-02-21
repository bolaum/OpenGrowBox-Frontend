import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import { motion } from 'framer-motion';
import formatLabel from '../../misc/formatLabel';

const WateringTracker = () => {
  const { entities, currentRoom, connection } = useHomeAssistant();
  const [lastWatered, setLastWatered] = useState('');
  const [wateringInterval, setWateringInterval] = useState(12); // Stunden als Integer
  const [wateringMinutes, setWateringMinutes] = useState(0); // Minuten als Integer
  const [manualInterval, setManualInterval] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [foodTimeSensor, setFoodTimeSensor] = useState([]);
  const [nextFood, setNextFood] = useState('');

  // Berechnet die verbleibende Zeit in Minuten,
  // wobei die Gesamtzeit = (Stunden * 60) + Minuten ist.
  const calculateTimeRemaining = () => {
    if (!lastWatered) return 0;
    const lastTime = new Date(lastWatered);
    const totalIntervalMinutes = wateringInterval * 60 + wateringMinutes;
    const nextWateringTime = new Date(lastTime.getTime() + totalIntervalMinutes * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.floor((nextWateringTime - now) / (1000 * 60)));
  };

  useEffect(() => {
    const roomKey = currentRoom.toLowerCase();
    if (entities[`sensor.ogb_plantfoodnextfeed_${roomKey}`]) {
      // Stelle sicher, dass der Wert als ganze Zahl dargestellt wird.
      setNextFood(parseInt(entities[`sensor.ogb_plantfoodnextfeed_${roomKey}`].state, 10));
    }
  }, [entities, currentRoom]);

  useEffect(() => {
    const updateFoodSensor = () => {
      const sensors = Object.entries(entities)
        .filter(
          ([key, entity]) =>
            key.startsWith('number.ogb') &&
            key.toLowerCase().includes('food') &&
            key.toLowerCase().includes(currentRoom.toLowerCase())
        )
        .map(([key, entity]) => ({
          id: key,
          value: parseInt(entity.state, 10), // Wert in Minuten als Integer
          lastWatered: entity.attributes.last_watered, // Annahme: Letzte Bewässerung als Attribut
          friendlyName: formatLabel(entity.attributes?.friendly_name || key),
        }));
  
      setFoodTimeSensor(sensors);
      if (sensors.length > 0) {
        const sensorValue = sensors[0].value; // Gesamtwert in Minuten
        if (!manualInterval) {
          // Umrechnung in Stunden und Minuten (ganzzahlig)
          setWateringInterval(Math.floor(sensorValue / 60));
          setWateringMinutes(sensorValue % 60);
        }
        if (sensors[0].lastWatered) setLastWatered(new Date(sensors[0].lastWatered));
      }
    };
  
    updateFoodSensor();
  }, [entities, currentRoom, manualInterval]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000);
    return () => clearInterval(timer);
  }, [lastWatered, wateringInterval, wateringMinutes]);

  const updateIntervalInHA = async (hoursValue, minutesValue) => {
    if (!connection || foodTimeSensor.length === 0) return;
    
    try {
      await connection.sendMessagePromise({
        type: 'call_service',
        domain: 'number',
        service: 'set_value',
        service_data: {
          entity_id: foodTimeSensor[0].id,
          // Gesamtwert in Minuten, als Integer
          value: parseInt(hoursValue, 10) * 60 + parseInt(minutesValue, 10),
        },
      });
    } catch (error) {
      console.error('Error updating interval:', error);
    }
  };

  const handleWatering = async () => {
    const now = new Date().toISOString();
    setLastWatered(now);
    setManualInterval(false);
  
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'fire_event',
          event_type: 'didFeedPlants',
          event_data: {
            room: currentRoom,
            timestamp: now,
          },
        });
      } catch (error) {
        console.error('Error triggering event:', error);
      }
    }
  };
  
  const { hours, minutes } = {
    hours: Math.floor(timeRemaining / 60),
    minutes: timeRemaining % 60,
  };

  // Berechnung für die Fortschrittsanzeige: Gesamtintervall in Minuten
  const totalIntervalMinutes = wateringInterval * 60 + wateringMinutes;
  const progressWidth = Math.min(100, 100 - (timeRemaining / totalIntervalMinutes) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <CounterContainer>
        <Header>
          <Title>💦 Watering Tracker - {currentRoom}</Title>
        </Header>

        <InputGroup>
          <NumberInput>
            <label>Watering Interval (Hours):</label>
            <input
              type="number"
              step="1"
              value={wateringInterval}
              min="1"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                setWateringInterval(value);
                setManualInterval(true);
                updateIntervalInHA(value, wateringMinutes);
              }}
            />
          </NumberInput>
          <NumberInput>
            <label>Watering Interval (Minutes):</label>
            <input
              type="number"
              step="1"
              value={wateringMinutes}
              min="0"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                setWateringMinutes(value);
                setManualInterval(true);
                updateIntervalInHA(wateringInterval, value);
              }}
            />
          </NumberInput>
        </InputGroup>

        <DisplayContainer>
          <TimeCounter $accent={hours < 12}>
            <div className="label">Next Watering In</div>
            <div className="count">{nextFood} m</div>
          </TimeCounter>
        </DisplayContainer>

        <ProgressBar>
          <WaterProgress
            style={{
              width: `${progressWidth}%`,
              background: hours < 12 ? '#FF5722' : '#4CAF50',
            }}
          />
        </ProgressBar>

        <ActionButton onClick={handleWatering} whileHover={{ scale: 1.05 }}>
          💧 Did Water Now!
        </ActionButton>
      </CounterContainer>
    </motion.div>
  );
};

export default WateringTracker;

// Styled Components
const CounterContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 1rem;
  border-radius: 2rem;
  background: var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
`;

const Header = styled.div`
  border-bottom: 2px solid var(--primary-button-color);
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
`;

const Title = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const InputGroup = styled.div`
  display: grid;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const NumberInput = styled.div`
  label {
    display: block;
    color: var(--main-text-color);
    margin-bottom: 0.125rem;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 0.15rem;
    border-bottom: 1px solid var(--primary-button-color);
    border-radius: 8px;
    background: var(--main-bg-color);
    color: var(--main-text-color);
    font-family: inherit;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
    }
  }
`;

const DisplayContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const TimeCounter = styled.div`
  text-align: center;
  width: 10rem;
  border-radius: 12px;
  padding: 0.5rem;
  background: ${props => props.$accent ? 'rgba(255, 87, 34, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
`;

const ProgressBar = styled.div`
  height: 0.8rem;
  background: var(--main-bg-color);
  border-radius: 4px;
  margin: 1rem 0;
`;

const WaterProgress = styled.div`
  height: 100%;
  transition: width 0.5s ease, background 0.3s ease;
`;

const ActionButton = styled(motion.button)`
  background: var(--second-bg-color);
  color: var(--main-text-color);
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;

  &:hover {
    background: var(--secondary-hover-color);
  }
`;
