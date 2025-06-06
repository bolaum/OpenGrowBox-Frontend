
import styled from 'styled-components';
import BottomBar from '../Components/Navigation/BottomBar';
import DashboardTitle from '../Components/Dashboard/DashboardTitle';

import RoomsCard from '../Components/Cards/RoomsCard';
import { useHomeAssistant } from '../Components/Context/HomeAssistantContext';
import TentControlCard from '../Components/Dashboard/TentControlCard';
import GlobalOverview from '../Components/Cards/GlobalOverview';
import DeviceCard from '../Components/Cards/ControlCards/DeviceCard';
import DashboardSlider from '../Components/Dashboard/DashboardSlider';
import DashboardStats from '../Components/Dashboard/DashboardStats';
const Home = () => {
  const {roomOptions} = useHomeAssistant()

  return (
    <MainContainer>
    <ContainerHeader>
      <DashboardTitle firstText="Open" secondText="Grow" thirdText="Box"/>
    </ContainerHeader>

  <InnerContent>
      <MainSection>
          <RoomsCard areas={roomOptions}/>
          <DashboardStats />
          <GlobalOverview/>
          <TentControlCard/>

        </MainSection>
        <DataSection>


          <DeviceCard />
          <DashboardSlider/>
        </DataSection>

    </InnerContent>
  

         <BottomBar/>
  </MainContainer>
  
);
};

export default Home;

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
gap:1rem;
width:40vw;
height: 100%;
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