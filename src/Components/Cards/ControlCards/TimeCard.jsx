import styled from 'styled-components';
import { useHomeAssistant } from "../../Context/HomeAssistantContext"
const TimeCard = ({ entities }) => {
  const { connection } = useHomeAssistant();

  if (!entities || entities.length === 0) {
    return <p>No time entities available</p>;
  }

  const handleTimeChange = async (entity, value) => {
    console.log(entity)
    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'opengrowbox', 
          service: 'update_time',
          service_data: {
            entity_id: entity.entity_id,
            time: value,
          },
        });

      } catch (error) {
        console.error('Error updating entity:', error);
      }
    }
  };

  return (
    <Container>
      {entities.map((entity) => (
      <Card key={entity.entity_id}>
        <Tooltip>{entity.tooltip}</Tooltip>  {/* Tooltip hier */}
        <Title>{entity.title}</Title>
        <TimeInput
          type="time"
          value={entity.state}
          onChange={(e) => handleTimeChange(entity, e.target.value)}
        />
      </Card>
      ))}
    </Container>
  );
};

export default TimeCard;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.45rem;
`;


const Tooltip = styled.div`
  position: absolute;
  top: -1.5rem;
  left: 1rem;
  background-color: rgba(50, 50, 50, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;


const Card = styled.div`
  position: relative;  /* wichtig für Tooltip */
  background: var(--main-bg-Innercard-color);
  border-radius: 8px;
  padding: 0.2rem;
  box-shadow: var(--main-shadow-art);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;


const Title = styled.p`
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: var(--main-text-color);
`;

const TimeInput = styled.input`
  display:flex;
  justify-content:space-around;
  width: 45%;
  padding: 0.1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  border: none;
  text-align: center;
  background:var(--secondary-accent);
  color: var(--main-text-color);

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }

  &:focus {
    outline: none;
    background: var(--main-hover-color);
`;
