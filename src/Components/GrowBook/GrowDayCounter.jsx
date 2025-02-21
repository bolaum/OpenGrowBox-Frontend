import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const GrowDayCounter = () => {
  const { entities, connection, currentRoom } = useHomeAssistant();

  // Zustände für die Sensoren
  const [breederTarget, setBreederTarget] = useState('');
  const [growStartDate, setGrowStartDate] = useState('');
  const [bloomSwitchDate, setBloomSwitchDate] = useState('');
  const [totalBloomDays, setTotalBloomDays] = useState('');
  const [plantTotalDays, setPlantTotalDays] = useState('');
  const [remainingDays, setRemainingDays] = useState('');

  // Hilfsfunktion: Formatiert Zahlen, sodass .0 entfernt wird
  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return Number.isInteger(num) ? num.toString() : num.toString();
  };

  // Aktualisieren von Zahlensensoren (z. B. Breeder Bloom Days)
  const handleNumberUpdate = async (entityId, value) => {
    console.log(`Updating ${entityId} to ${value}`);
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'number',
          service: 'set_value',
          service_data: { entity_id: entityId, value },
        });
        console.log(`Updated ${entityId} successfully!`);
      } catch (error) {
        console.error('Error updating entity:', error);
      }
    }
  };

  // Aktualisieren von Datumssensoren
  const handleDateUpdate = async (entityId, value) => {
    console.log(`Updating ${entityId} to ${value}`);
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'opengrowbox',
          service: 'update_date',
          service_data: { entity_id: entityId, date: value },
        });
        console.log(`Updated ${entityId} successfully!`);
      } catch (error) {
        console.error('Error updating entity:', error);
      }
    }
  };

  // Lokale States anhand der Home Assistant Entities aktualisieren
  useEffect(() => {
    const roomKey = currentRoom.toLowerCase();
    if (entities[`number.ogb_breederbloomdays_${roomKey}`]) {
      setBreederTarget(entities[`number.ogb_breederbloomdays_${roomKey}`].state);
    }
    if (entities[`date.ogb_growstartdate_${roomKey}`]) {
      setGrowStartDate(entities[`date.ogb_growstartdate_${roomKey}`].state);
    }
    if (entities[`date.ogb_bloomswitchdate_${roomKey}`]) {
      setBloomSwitchDate(entities[`date.ogb_bloomswitchdate_${roomKey}`].state);
    }
    if (entities[`sensor.ogb_totalbloomdays_${roomKey}`]) {
      setTotalBloomDays(entities[`sensor.ogb_totalbloomdays_${roomKey}`].state);
    }
    if (entities[`sensor.ogb_planttotaldays_${roomKey}`]) {
      setPlantTotalDays(entities[`sensor.ogb_planttotaldays_${roomKey}`].state);
    }
    if (entities[`sensor.ogb_chopchoptime_${roomKey}`]) {
      setRemainingDays(entities[`sensor.ogb_chopchoptime_${roomKey}`].state);
    }
  }, [entities, currentRoom]);

  return (
    <>
      <MotionContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        <CounterCard>
          <CardHeader>
            <CardTitle>🌱 Grow Day Counter</CardTitle>
          </CardHeader>
          <InputSection>
            <InputGroup>
              <InputLabel>Breeder Bloom Days (FlowerTime):</InputLabel>
              <StyledInput
                type="number"
                value={formatNumber(breederTarget)}
                onChange={(e) => {
                  const value = e.target.value;
                  setBreederTarget(value);
                  handleNumberUpdate(`number.ogb_breederbloomdays_${currentRoom.toLowerCase()}`, value);
                }}
              />
            </InputGroup>
            <InputGroup>
              <InputLabel>Grow Start Date:</InputLabel>
              <StyledInput
                type="date"
                value={growStartDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setGrowStartDate(value);
                  handleDateUpdate(`date.ogb_growstartdate_${currentRoom.toLowerCase()}`, value);
                }}
              />
            </InputGroup>
            <InputGroup>
              <InputLabel>Bloom Switch Date:</InputLabel>
              <StyledInput
                type="date"
                value={bloomSwitchDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setBloomSwitchDate(value);
                  handleDateUpdate(`date.ogb_bloomswitchdate_${currentRoom.toLowerCase()}`, value);
                }}
              />
            </InputGroup>
          </InputSection>
          <DisplaySection>
            <DisplayItem>
              <DisplayLabel>Plant Total Days:</DisplayLabel>
              <DisplayValue>{formatNumber(plantTotalDays)}</DisplayValue>
            </DisplayItem>
            <DisplayItem>
              <DisplayLabel>Total Bloom Days:</DisplayLabel>
              <DisplayValue>{formatNumber(totalBloomDays)}</DisplayValue>
            </DisplayItem>
            <DisplayItem>
              <DisplayLabel>Remaining Days Until Harvest:</DisplayLabel>
              <DisplayValue>{formatNumber(remainingDays)}</DisplayValue>
            </DisplayItem>
          </DisplaySection>
        </CounterCard>
      </MotionContainer>
    </>
  );
};

export default GrowDayCounter;

// Styled Components
const MotionContainer = motion(styled.div``);

const CounterCard = styled.div`
  background: var(--main-bg-card-color);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 2rem auto;
  box-shadow: var(--main-shadow-art);
  color: var(--main-text-color);
  font-family: 'Arial', sans-serif;
`;

const CardHeader = styled.div`
  border-bottom: 2px solid var(--primary-accent);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  font-weight: 600;
`;

const StyledInput = styled.input`
  padding: 0.6rem;
  border: 1px solid var(--primary-accent);
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-accent);
  }
`;

const DisplaySection = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const DisplayItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
`;

const DisplayLabel = styled.span`
  font-size: 0.85rem;
`;

const DisplayValue = styled.span`
  font-size: 1rem;
  font-weight: bold;
`;