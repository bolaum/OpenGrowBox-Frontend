import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHomeAssistant } from "../../Context/HomeAssistantContext";

const SwitchCard = ({ entities, isLocked = false }) => {
  const { connection } = useHomeAssistant();

  if (!entities || entities.length === 0) {
    return <p>No switch entities available</p>;
  }

  const handleToggle = async (entity) => {
    if (isLocked || !connection) return;

    const isOn = entity.state === 'on';

    try {
      await connection.sendMessagePromise({
        type: 'call_service',
        domain: 'homeassistant',
        service: isOn ? 'turn_off' : 'turn_on',
        service_data: {
          entity_id: entity.entity_id,
        },
      });
    } catch (error) {
      console.error('Error toggling switch:', error);
    }
  };

  return (
    <Container>
      {entities.map((entity) => (
      <Card key={entity.entity_id}>
        <CardHeader>
          <Tooltip>{entity.tooltip}</Tooltip> {/* Tooltip anzeigen */}
          <Title>{entity.title || entity.entity_id}</Title>
          <ToggleSwitch $isLocked={isLocked}>
            <SwitchInput
              type="checkbox"
              checked={entity.state === 'on'}
              onChange={() => handleToggle(entity)}
              disabled={isLocked}
            />
            <SliderTrack />
          </ToggleSwitch>
        </CardHeader>
      </Card>

      ))}
    </Container>
  );
};

export default SwitchCard;

SwitchCard.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.object),
  isLocked: PropTypes.bool,
};

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
  left: 0;
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
  position: relative; /* Für Tooltip-Positionierung */
  background: rgba(83, 61, 85, 0.29);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;


const CardHeader = styled.div`
  display: flex;
  margin-left:1rem;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.p`
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--main-text-color);
  flex: 1;
`;

const ToggleSwitch = styled.label`
  position: relative;
  margin-right:0.3rem;
  display: inline-block;
  width: 42px;
  height: 24px;
  cursor: ${(props) => (props.$isLocked ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$isLocked ? 0.4 : 1)};
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--primary-accent);
  }

  &:checked + span:before {
    transform: translateX(18px);
  }
`;

const SliderTrack = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;
