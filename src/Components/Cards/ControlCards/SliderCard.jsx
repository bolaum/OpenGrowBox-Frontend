
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHomeAssistant } from "../../Context/HomeAssistantContext"
const SliderCard = ({ entities, isLocked = false }) => {
  const { connection } = useHomeAssistant();

  if (!entities || entities.length === 0) {
    return <p>No slider entities available</p>;
  }

  const handleSliderChange = async (entity, value) => {
    if (isLocked) {
      return;
    }

    if (connection) {
      try {
        await connection.sendMessagePromise({
          type: 'call_service',
          domain: 'number',
          service: 'set_value',
          service_data: {
            entity_id: entity.entity_id,
            value: value,
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
          <CardHeader>
            <Tooltip>{entity.tooltip}</Tooltip>
            <Title>{entity.title}</Title>
            <Value>{entity.state}</Value>
            <Unit>{entity.unit}</Unit>
          </CardHeader>
          <SliderWrapper>
            <Slider
              type="range"
              min={entity.min}
              max={entity.max}
              step={entity.step}
              value={entity.state}
              onChange={(e) => handleSliderChange(entity, e.target.value)}
              disabled={isLocked}
            />

          </SliderWrapper>
        </Card>
      ))}
    </Container>
  );
};

export default SliderCard;

SliderCard.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.object),
  isLocked: PropTypes.bool,
};

const Container = styled.div`
  display: flex;
  width:100%;
  flex-direction: column;
  justify-content:center;
  margin-top:0.45rem;
  gap: 0.5rem;
  color:var(--main-text-color);
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
  opacity: 0; /* standardmäßig versteckt */
  transition: opacity 0.2s ease-in-out;
`;

const Card = styled.div`
  position: relative; /* wichtig für Tooltip */
  background: var(--main-bg-Innercard-color);
  border-radius: 8px;
  box-shadow: var(--main-shadow-art);
  display: flex;
  flex-direction: column;

  &:hover ${Tooltip} {
    opacity: 1; /* Tooltip bei Hover anzeigen */
  }
`;


const CardHeader = styled.div`
  display: flex;
  justify-content:space-around;
  align-items:center;
`

const Title = styled.p`
  margin-left:1rem;
  font-size: 0.8rem;
  font-weight: bold;
  width:80%;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;

  width:100%;


`;

const Slider = styled.input.attrs(props => ({
    type: 'range',
    style: {
      '--min': props.min,
      '--max': props.max,
      '--val': props.value,
      '--step': props.step,
    }
  }))`
  flex-grow: 1;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(
    to right,
rgb(189, 252, 192) 0%,
rgb(13, 234, 20) calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
    #777 calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
    #777 100%
  );
  appearance: none;
  transition: background 0.3s ease;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};

  &:focus {
    outline: none;
  }
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: var(--main-unit-color);
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  &::-moz-range-thumb {
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: var(--main-unit-color);
    cursor: pointer;
    transition: background 0.3s ease;
  }
`;

const Value = styled.div`
color: var(--main-value-color);
`

const Unit = styled.div`
padding-left:0.3rem;
margin-right:0.4rem;  
width:15%;
color: var(--main-unit-color);
`


