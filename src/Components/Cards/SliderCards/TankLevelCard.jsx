import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../../Context/HomeAssistantContext';
import formatLabel from '../../../misc/formatLabel';
import HistoryChart from '../HistoryChart';

const TankLevelCard = ({pause,resume,isPlaying}) => {
  const { entities } = useHomeAssistant();
  const [tankLevelSensors, setTankLevelSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);

  useEffect(() => {
    const updateTankLevelCard = () => {
      const sensors = Object.entries(entities)
      .filter(([key, entity]) => {
        const rawValue = parseFloat(entity.state);
        const id = key.toLowerCase();

        // Tank level sensor patterns
        const patterns = [
          /tank_level($|[^a-zA-Z])/,
          /water_level($|[^a-zA-Z])/,
          /reservoir_level($|[^a-zA-Z])/,
        ];

        const matchesSensorType = patterns.some((pattern) => pattern.test(id));

        return (
          key.startsWith('sensor.') &&
          matchesSensorType &&
          !id.includes('phone') &&
          !id.includes('mqtt') &&
          !id.includes('connect') &&
          !isNaN(rawValue)
        );
      })
        .map(([key, entity]) => {
          const rawValue = parseFloat(entity.state);
          const unit = entity.attributes?.unit_of_measurement || '%';
          return {
            id: key,
            value: rawValue,
            unit: unit,
            friendlyName: formatLabel(entity.attributes?.friendly_name || key),
          };
        });

      setTankLevelSensors(sensors);
    };

    updateTankLevelCard();
  }, [entities]);

  const getColorForValue = (value, unit) => {
    const unitLower = unit.toLowerCase();
  
    // Farben für Prozent-Werte (Tank Level)
    if (unitLower.includes('%')) {
      if (value <= 10) return '#ef4444'; // Kritisch niedrig (Rot)
      if (value > 10 && value <= 25) return 'rgba(230, 63, 12, 0.85)'; // Niedrig (Orange-Rot)
      if (value > 25 && value <= 50) return 'rgba(230, 212, 12, 0.85)'; // Medium (Gelb)
      if (value > 50 && value <= 75) return 'rgba(197, 230, 12, 0.85)'; // Gut (Gelb-Grün)
      return 'rgba(85, 230, 12, 0.85)'; // Voll (Grün)
    }

    // Farben für Liter-Werte
    if (unitLower.includes('l') || unitLower.includes('liter')) {
      if (value <= 50) return '#ef4444'; // Niedrig
      if (value > 50 && value <= 150) return 'rgba(230, 63, 12, 0.85)';
      if (value > 150 && value <= 300) return 'rgba(230, 212, 12, 0.85)';
      if (value > 300 && value <= 500) return 'rgba(197, 230, 12, 0.85)';
      return 'rgba(85, 230, 12, 0.85)';
    }

    // Farben für cm/m Werte (Füllstand)
    if (unitLower.includes('cm') || unitLower.includes('m')) {
      if (value <= 10) return '#ef4444';
      if (value > 10 && value <= 25) return 'rgba(230, 63, 12, 0.85)';
      if (value > 25 && value <= 50) return 'rgba(230, 212, 12, 0.85)';
      if (value > 50 && value <= 75) return 'rgba(197, 230, 12, 0.85)';
      return 'rgba(85, 230, 12, 0.85)';
    }

    return '#ffffff'; // Standard: Weiß
  };

  const formatValue = (value) => {
    return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  };

  const handleDataBoxClick = (sensorId) => {
    pause(); 
    setSelectedSensor(sensorId);
  };

  const closeHistoryChart = () => {
    setSelectedSensor(null);
    if(isPlaying){
      resume(); 
    }
  };

  return (
    <CardContainer>
      <Header><h4> RESERVOIR LEVEL</h4></Header>
      <Content>
        {tankLevelSensors.map((sensor) => (
          <DataBox key={sensor.id} onClick={() => handleDataBoxClick(sensor.id)}>
            <Label>{sensor.friendlyName}</Label>
            <ValueWrapper>
              <Value style={{ color: getColorForValue(sensor.value, sensor.unit) }}>
                {formatValue(sensor.value)}
              </Value>
              <Unit>{sensor.unit}</Unit>
            </ValueWrapper>
          </DataBox>
        ))}
        {tankLevelSensors.length === 0 && <NoData>No Tank Level sensors found.</NoData>}
      </Content>

      {/* History Chart Modal */}
      {selectedSensor && (
        <ModalOverlay onClick={closeHistoryChart}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <HistoryChart sensorId={selectedSensor} onClose={closeHistoryChart} />
          
          </ModalContent>
        </ModalOverlay>
      )}
    </CardContainer>
  );
};

export default TankLevelCard;

const CardContainer = styled.div``;

const Header = styled.div`
  font-size: 0.8rem;
  color: var(--main-unit-color);
  margin-top: -2rem;
  @media (max-width: 768px) {
    width: 10%;
    transition: color 0.3s ease;
  }
`;

const Content = styled.div``;

const DataBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem;
  min-width: 100%;
  flex-direction: row;
  background: var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
  margin-top: 0.5rem;
  color: var(--main-text-color);
  cursor: pointer;
`;

const ValueWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Label = styled.div``;

const Value = styled.div``;

const Unit = styled.div``;

const NoData = styled.div``;

// Modal-Styling
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 11;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  width: 65%;
  height: 65%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
