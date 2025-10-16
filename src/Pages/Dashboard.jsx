import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardTitle from '../Components/Dashboard/DashboardTitle';
import DashboardChart from '../Components/Dashboard/DashboardChart';
import BottomBar from '../Components/Navigation/BottomBar';
import { useHomeAssistant } from '../Components/Context/HomeAssistantContext';
import RoomSelectCard from '../Components/Cards/RoomSelectCard';
import GrowMetrics from '../Components/Dashboard/GrowMetrics'
import SelectCard from '../Components/Cards/ControlCards/SelectCard';
import { option } from 'framer-motion/client';

const DEFAULT_VIEW = '8h';
const LIVE_REFRESH_MS = 5000;
const VIEW_OFFSETS = {
  '1h': 1 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const getDefaultDate = (offset = 0) => {
    const date = new Date(Date.now() + offset);
    const localISOTime = new Date(date.getTime()).toISOString()
    return localISOTime;
  };

const resolveView = (view) => VIEW_OFFSETS[view] ? view : DEFAULT_VIEW;

const calculateRange = (view) => {
  const resolvedView = resolveView(view);
  const offset = VIEW_OFFSETS[resolvedView];
  return {
    startDate: getDefaultDate(-offset),
    endDate: getDefaultDate(),
  };
};

const useViewDates = (view, isLive) => {
  const [range, setRange] = useState(() => calculateRange(view));

  useEffect(() => {
    setRange(calculateRange(view));
  }, [view]);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    const interval = setInterval(() => {
      setRange(calculateRange(view));
    }, LIVE_REFRESH_MS);

    return () => clearInterval(interval);
  }, [isLive, view]);

  return range;
};

const Dashboard = () => {
  const { currentRoom, entities } = useHomeAssistant();
  const [co2Sensors, setCo2Sensors] = useState([]);
  
  const [selectedView, setSelectedView] = useState(() => localStorage.getItem('selectedView') || DEFAULT_VIEW);
  const [isLive, setIsLive] = useState(() => localStorage.getItem('dashboardIsLive') === 'true');
  const { startDate, endDate } = useViewDates(selectedView, isLive);
  
  useEffect(() => {
    localStorage.setItem('selectedView', selectedView);
  }, [selectedView]);
  
  useEffect(() => {
    localStorage.setItem('dashboardIsLive', isLive ? 'true' : 'false');
  }, [isLive]);

  useEffect(() => {
    const updateCo2Sensors = () => {
      const sensors = Object.entries(entities)
        .filter(
          ([key, entity]) =>
            key.startsWith('sensor.') &&
            (key.toLowerCase().includes('co2') || key.toLowerCase().includes('carbon')) &&
            !isNaN(parseFloat(entity.state))
        )
        .map(([key, entity]) => ({
          id: key,
          value: parseFloat(entity.state),
          unit: entity.attributes?.unit_of_measurement,
          entity_id: entity.entity_id,
        }));
      setCo2Sensors(sensors);
    };
    updateCo2Sensors();
  }, [entities]);

  const vpdSensor = `sensor.ogb_currentvpd_${currentRoom}`;
  const avgTempSensor = `sensor.ogb_avgtemperature_${currentRoom}`;
  const avgHumSensor = `sensor.ogb_avghumidity_${currentRoom}`;

  if (!currentRoom) {
    return <></>;
  }
  
  return (
    <MainContainer>
      <ContainerHeader>
        <DashboardTitle firstText="OGB" secondText="Grow" thirdText="Monitor"/>
      </ContainerHeader>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexFlow: 'wrap' }}
      >
        <RoomSelectCard />
        <ChartMenu
          style={{ alignSelf: 'end', flexFlow: 'wrap'}}
        >
          {Object.keys(VIEW_OFFSETS).map(view => (
            <ViewButton
              key={view}
              $isActive={selectedView === view}
              onClick={() => setSelectedView(view)}
            >
              {view}
            </ViewButton>
          ))}
          <SelectRow>
            <SelectCard 
              entities={[
                {
                  title: "Live",
                  entity_id: "switch.isLive",
                  options: ["true", "false"],
                  state: String(isLive),
                }
              ]} 
              changesHandler={ (entity, value) => setIsLive(value === 'YES')} 
            />
          </SelectRow>
        </ChartMenu>
      </div>

      <InnerContent
        as={motion.div}
        initial={false}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >

        <MainSection>
          <GrowMetrics room={currentRoom} 
            isLive={isLive} 
            timeRange={selectedView}
            startDate={startDate}
            endDate={endDate}
          />
        </MainSection>
        <DataSection>
          
          <DashboardChart 
            sensorId={vpdSensor} 
            title="VPD" 
            unit="kPa" 
            isLive={isLive} 
            selectedView={selectedView}
            startDate={startDate}
            endDate={endDate}
          />
          <DashboardChart 
            sensorId={avgTempSensor} 
            title="Avg Temp" 
            unit="°C" 
            isLive={isLive} 
            selectedView={selectedView}
            startDate={startDate}
            endDate={endDate}
          />
          <DashboardChart 
            sensorId={avgHumSensor} 
            title="Avg Humidity" 
            unit="%" 
            isLive={isLive} 
            selectedView={selectedView}
            startDate={startDate}
            endDate={endDate}/>

          {co2Sensors && co2Sensors.length > 0 && 
          co2Sensors.map((sensor) => (
            <DashboardChart
              key={sensor.id}
              sensorId={sensor.entity_id}
              title="CO₂"
              unit={sensor.unit}
            />
          ))
          }

        </DataSection>
      </InnerContent>
      <BottomBar />
    </MainContainer>
  );
};

export default Dashboard;

const MainContainer = styled.div`
  overflow-y: auto;
  padding-bottom: 10vh;
  @media (max-width: 480px) {
    transition: color 0.3s ease;
  }
  @media (max-width: 768px) {
    height: calc(100vh - 12.0vh);
  }
  @media (max-width: 1024px) {
  }
`;

const InnerContent = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem;
  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    transition: color 0.3s ease;
  }
  @media (max-width: 480px) {
    transition: color 0.3s ease;
  }
`;

const MainSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 50%;
  height: 100%;
  min-width: 180px;
  margin-left:1rem;
  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
  @media (max-width: 768px) {
    width: 100%;
    transition: color 0.3s ease;
  }
  @media (max-width: 480px) {
    transition: color 0.3s ease;
  }
`;

const DataSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 50%;
  height: 92%;

  min-width: 180px;
  @media (max-width: 1024px) {
    transition: color 0.3s ease;
  }
  @media (max-width: 768px) {
    width: 100%;
    transition: color 0.3s ease;
  }
  @media (max-width: 480px) {
    transition: color 0.3s ease;
  }
`;

const ContainerHeader = styled.div`
  display: flex;
  top: 1;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 3.5vh;
  margin-bottom: 0.5rem;
  padding: 0 2rem;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const SelectRow = styled.div`
  display: flex;
  align-self: flex-end;
  margin-top: -0.2rem;
  
  & > div {
    min-width: 110px;
  }
`;

const ChartMenu = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.25rem;
  backdrop-filter: blur(10px);
`;

const ViewButton = styled.button`
  background: ${props => (props.$isActive ? 'var(--primary-button-color)' : 'transparent')};
  color: var(--main-text-color);
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: var(--primary-button-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;