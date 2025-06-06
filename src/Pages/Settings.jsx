
import styled from 'styled-components';
import BottomBar from '../Components/Navigation/BottomBar';
import DashboardTitle from '../Components/Dashboard/DashboardTitle';
import SettingsPanel from '../Components/Settings/SettingsPanel';

const Settings = () => {
  return (
    <MainContainer >
      <ContainerHeader>
        <DashboardTitle firstText="Settings"/>
      </ContainerHeader>

      <InnerContent>
        <MainSection>

        <SettingsPanel/>

        </MainSection>

      </InnerContent>
      <BottomBar/>
    </MainContainer>
  );
};

export default Settings;

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

const InnerContent= styled.div`
display:flex;
height:100%;
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
justify-content:center;
align-items:center;
gap:1rem;
width:100vw;

min-width:180px;

    @media (min-width: 1024px) {
        width:200vh;
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


