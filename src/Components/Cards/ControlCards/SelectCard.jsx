
import styled from 'styled-components';
import { useHomeAssistant } from "../../Context/HomeAssistantContext"
const SelectCard = ({ entities, changesHandler = null }) => {
  const { connection } = useHomeAssistant();

  if (!entities || entities.length === 0) {
    return <p>No select entities available</p>;
  }

  const handleChange = async (entity, newValue) => {
    if (changesHandler) {
      changesHandler(entity, newValue);
      return;
    }

    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'select',
          service: 'select_option',
          service_data: {
            entity_id: entity.entity_id,
            option: newValue,
          },
        });

      } catch (error) {
        console.error('Error updating entity:', error);
      }
    }
  };

  return (
    <Container>
      {entities.map((entity) => {
        const isToggle =
          entity.options.length === 2 &&
          entity.options.every((opt) =>
            ['true', 'false', 'yes', 'no', 'on', 'off'].includes(opt.toLowerCase())
          );

        const isActive =
          entity.state === 'true' || entity.state === 'on' || entity.state === 'YES';

        return (
        <Card key={entity.entity_id}>
          <Tooltip>{entity.tooltip}</Tooltip> {/* Tooltip hier anzeigen */}
          <Title>{entity.title}</Title>

          {isToggle ? (
            <ToggleWrapper onClick={() => handleChange(entity, isActive ? 'NO' : 'YES')}>
              <ToggleBackground $isActive={isActive}>
                <ToggleCircle $isActive={isActive} />
              </ToggleBackground>
            </ToggleWrapper>
          ) : (
            <Dropdown
              value={entity.state}
              onChange={(e) => handleChange(entity, e.target.value)}
            >
              {entity.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Dropdown>
          )}
        </Card>
        );
      })}
    </Container>
  );
};

export default SelectCard;

const Container = styled.div`
  display: flex;
  width:100%;
  flex-direction: column;
  justify-content:center;
  margin-top:0.2rem;
  gap: 0.4rem;
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
  position: relative; /* wichtig für Tooltip-Position */
  background: rgba(83, 61, 85, 0.29);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, 
              rgba(0, 0, 0, 0.12) 0px -12px 30px, 
              rgba(0, 0, 0, 0.12) 0px 4px 6px, 
              rgba(0, 0, 0, 0.17) 0px 12px 13px, 
              rgba(0, 0, 0, 0.09) 0px -3px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;
const Title = styled.p`
  margin-left:1rem;
  color: var(--main-text-color);
  font-size: 0.8rem;
  font-weight: bold;
`;

const Dropdown = styled.select`
  padding: 0.2rem;
  border-radius: 6px;
    margin-right:0.4rem;  
  background:rgba(100, 96, 96, 0.18);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: var(--main-text-color);
  border: none;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #444;
  }
`;

/* Toggle Button */
const ToggleWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content:center;
`;

const ToggleBackground = styled.div.attrs({
  part: 'toggle-background',
})`
  margin-right: 0.4rem;
  width: 50px;
  height: 0.8rem;
  border-radius: 12px;
  background: ${(props) => (props.$isActive ? '#4caf50' : '#777')};
  display: flex;
  align-items: center;
  padding: 2px;
  transition: background 0.3s ease-in-out;
`;

const ToggleCircle = styled.div.attrs({
  part: 'toggle-circle',
})`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transform: ${(props) => (props.$isActive ? 'translateX(26px)' : 'translateX(0)')};
  transition: transform 0.3s ease-in-out;
`;

