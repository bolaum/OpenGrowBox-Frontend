import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../../Context/HomeAssistantContext';
import formatLabel from '../../../misc/formatLabel';
import HistoryChart from '../HistoryChart';

const ECCard = ({pause,resume,isPlaying}) => {
  const { entities, connection } = useHomeAssistant();
  const [ecSensors, setEcSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null); // State für ausgewählten Sensor (Modal)

  const convertEC = (value, unit) => {
    if (unit === "µS/cm") {
      return value / 1000; // Umrechnung von µS/cm in mS/cm
    }
    return value; // Falls bereits in mS/cm
  };

  useEffect(() => {
    const updateDewCard = () => {
        const sensors = Object.entries(entities)
          .filter(
            ([key, entity]) =>
              key.startsWith('sensor.') &&
              (key.toLowerCase().includes('soil') || key.toLowerCase().includes('boden'))  &&
              !key.toLowerCase().includes('wifi') && 
              !key.toLowerCase().includes('mqtt') &&
              !key.toLowerCase().includes('connect') &&
              !isNaN(parseFloat(entity.state))
          )
        .map(([key, entity]) => {
          const rawValue = parseFloat(entity.state);
          const unit = entity.attributes?.unit_of_measurement || 'mS/cm';
          return {
            id: key,
            value: convertEC(rawValue, unit), // Einheit konvertieren
            unit: 'mS/cm', // Alle Werte einheitlich in mS/cm darstellen
            friendlyName: formatLabel(entity.attributes?.friendly_name || key),
          };
        });

      setEcSensors(sensors);
    };

    updateDewCard();
  }, [entities]);

  const getColorForValue = (value) => {
    if (value < 0.1) return '#60a5fa'; // Sehr niedrige Leitfähigkeit (evtl. zu wenig Nährstoffe)
    if (value >= 0.1 && value <= 0.5) return 'rgba(85, 230, 12, 0.85)'; // Optimaler Bereich
    if (value > 0.5 && value <= 1.0) return 'rgba(197, 230, 12, 0.85)'; // Mittlerer Bereich
    if (value > 1.0 && value <= 1.5) return 'rgba(230, 212, 12, 0.85)'; // Hoher EC-Wert
    if (value > 1.5 && value <= 2.5) return 'rgba(230, 63, 12, 0.85)'; // Hoher EC-Wert
    return '#ef4444'; // Extrem hohe EC-Werte
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
      <Header><h4>SOIL EC</h4></Header>
      <Content>
        {ecSensors.map((sensor) => (
          <DataBox key={sensor.id} onClick={() => handleDataBoxClick(sensor.id)}>
            <Label>{sensor.friendlyName}</Label>
            <ValueWrapper>
              <Value style={{ color: getColorForValue(sensor.value) }}>
                {sensor.value.toFixed(2)}
              </Value>
              <Unit>{sensor.unit}</Unit>
            </ValueWrapper>
          </DataBox>
        ))}
        {ecSensors.length === 0 && <NoData>No EC sensors found.</NoData>}
      </Content>

      {/* Bedingtes Rendern des Modals */}
      {selectedSensor && (
        <ModalOverlay onClick={closeHistoryChart}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <HistoryChart sensorId={selectedSensor} onClose={closeHistoryChart} />
            <CloseButton onClick={closeHistoryChart}>X</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </CardContainer>
  );
};

export default ECCard;

const CardContainer = styled.div`
  position: relative;
`;

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
  height: 55%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--main-text-color);
`;
