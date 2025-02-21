import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardTitle from '../Components/Dashboard/DashboardTitle';
import DashboardChart from '../Components/Dashboard/DashboardChart';
import DashboardSlider from '../Components/Dashboard/DashboardSlider'
import BottomBar from '../Components/Navigation/BottomBar';
import { useHomeAssistant } from '../Components/Context/HomeAssistantContext';
import RoomSelectCard from '../Components/Cards/RoomSelectCard'
const Dashboard = () => {
  const {currentRoom} = useHomeAssistant()

  const vpdSensor = `sensor.ogb_currentvpd_${currentRoom}`
  const avgTempSensor = `sensor.ogb_avgtemperature_${currentRoom}`
  const avgHumSensor = `sensor.ogb_avghumidity_${currentRoom}`


  return (
    <MainContainer>
      <ContainerHeader>
        <DashboardTitle firstText="Dash" secondText="Board" />
      </ContainerHeader>
      <InnerContent
        as={motion.div}
        initial={false}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <MainSection>

        <RoomSelectCard/>
          <DashboardChart sensorId={avgTempSensor} title="Avg Temp" unit="°C" />
          <DashboardChart sensorId={avgHumSensor} title="Avg Humidity" unit="%" />

        </MainSection>
        <DataSection>
          <DashboardChart sensorId={vpdSensor} title="VPD" unit="kPa" />
          <DashboardSlider/>
        </DataSection>
      </InnerContent>
      <BottomBar />
    </MainContainer>
  );
};

export default Dashboard;

const MainContainer = styled.div`
  overflow-y: auto;
  /* Padding hinzufügen, das der Höhe deiner BottomBar entspricht */
  padding-bottom:10vh;
  @media (max-width: 480px) {
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {

    height: calc(100vh - 12.0vh);
  }

  @media (max-width: 1024px) {

  }
`;


const InnerContent= styled.div`
display:flex;

gap:0.5rem;
margin:1rem;
    @media (max-width: 1024px) {
        transition: color 0.3s ease;
    }

    @media (max-width: 768px) {
        flex-direction:column;
        transition: color 0.3s ease;
    }

    @media (max-width: 480px) {
        transition: color 0.3s ease;
    }

`

const MainSection = styled.section`

display:flex;
flex-direction:column;

align-items:center;

gap:1rem;
width:35%;
height:92%;;
min-width:180px;

    @media (max-width: 1024px) {
        transition: color 0.3s ease;
    }

    @media (max-width: 768px) {
        width:100%;
        transition: color 0.3s ease;
    }

    @media (max-width: 480px) {
        transition: color 0.3s ease;
    }

`
const DataSection = styled.section`
display:flex;
flex-direction:column;
gap:1rem;
width:60vw;
height:92%;;
min-width:180px;


    @media (max-width: 1024px) {
        transition: color 0.3s ease;

    }

    @media (max-width: 768px) {
        width:100%;
        transition: color 0.3s ease;
    }

    @media (max-width: 480px) {
        transition: color 0.3s ease;
    }
`

const ContainerHeader = styled.div`
    display: flex;

    top:1;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 3.5vh;
    margin-bottom: 0.5rem;
    padding: 0 2rem;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

`;