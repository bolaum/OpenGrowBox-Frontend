import styled from 'styled-components';
import RoomSelectCard from '../Cards/RoomSelectCard';
import ControllCard from '../Cards/ControllCard';


const TentControlCard = () => {
  return (
    <DashBoardControl>
      <RoomSelectCard title="Current Room"/>
      <ControllCard/>
    </DashBoardControl>
  );
};

export default TentControlCard;

// Styled Components
const DashBoardControl = styled.div`
  display: flex;

  gap:0.5rem;
  flex-direction:column;
  align-items:center;
  padding:0.5rem;
  border-radius: 20px;
  background:  var(--main-bg-card-color);
  box-shadow: var(--main-shadow-art);
    @media (max-width: 768px) {
        min-width: 300px;
        width:100%;
        transition: color 0.3s ease;
    }


    @media (max-width: 1024px) {
        transition: color 0.3s ease;
    }


`;

