import React, { useState } from 'react';
import SelectCard from './SelectCard';
import SliderCard from './SliderCard';
import TimeCard from './TimeCard';
import { useHomeAssistant } from "../../Context/HomeAssistantContext"

const groupMappings = {
  'Main Control': {
    includeKeywords: ['vpd', 'plant', 'mode', 'leaf'],
    excludeKeywords: ['proportional', 'derivativ', 'integral',"light","food","days"],
  },
  "Lights": {
    includeKeywords: ['light', 'sun'],
    excludeKeywords: ['device'],
  },
  'CO₂ Control': {
    includeKeywords: ['co2'],
    excludeKeywords: [],
  },
  "Watering": {
    includeKeywords: ['pump', 'water'],
    excludeKeywords: [],
  },
  'Device Settings': {
    includeKeywords: ['device'],
    excludeKeywords: ['debug'],
  },
  "Targets": {
    includeKeywords: ['weight', 'min', 'max'],
    excludeKeywords: ['co2',"min","max"],
  },
  "Drying": {
    includeKeywords: ['drying'],
    excludeKeywords: [
      'device',
      'vpd',
      'temp',
      'hum',
      'co2',
      'light',
      'sun',
      'stage',
      'plant',
      'leaf',
      'borrow',
      'weigh',
    ],
  },
  'P.I.D': {
    includeKeywords: ['proportional', 'derivativ', 'integral', 'pid'],
    excludeKeywords: [],
  },
};

const ControllCollection = ({ option }) => {
  const { entities, currentRoom } = useHomeAssistant();
  const [currentControl, setCurrentControl] = useState('Home');

  const group = groupMappings[option];
  const includedKeywords = group ? group.includeKeywords : [];
  const excludedKeywords = group ? group.excludeKeywords : [];



  const formatTitle = (title) => {
    return title
      .replace(/^OGB_/, '')
      .replace(/_/g, ' ')
      .replace(new RegExp(`${currentRoom}$`, 'i'), '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filterEntitiesByKeywords = (
    entities,
    includeKeywords,
    excludeKeywords,
    currentRoom
  ) => {
    return Object.entries(entities)
      .filter(([key]) => {
        const lowerKey = key.toLowerCase();
        const matchesInclude =
          includeKeywords.length === 0 ||
          includeKeywords.some((keyword) =>
            lowerKey.includes(keyword.toLowerCase())
          );
        const matchesExclude = excludeKeywords.some((keyword) =>
          lowerKey.includes(keyword.toLowerCase())
        );
        const roomMatches = currentRoom
          ? lowerKey.includes(currentRoom.toLowerCase())
          : true;
        return matchesInclude && !matchesExclude && roomMatches;
      })
      .map(([key, entity]) => ({
        title: formatTitle(entity.attributes?.friendly_name || entity.entity_id),
        entity_id: entity.entity_id,
        attributes: entity.attributes || {},
        options: entity.attributes?.options || [],
        min: entity.attributes?.min || 0,
        max: entity.attributes?.max || 100,
        step: entity.attributes?.step || 1,
        state: entity?.state || 50,
        unit: entity.attributes?.unit_of_measurement || '',
      }));
  };

  const dropdownEntities = filterEntitiesByKeywords(
    entities,
    includedKeywords,
    excludedKeywords,
    currentRoom
  ).filter(
    (entity) =>
      entity.entity_id.startsWith('select.') && entity.options.length > 0
  );


  const sliderEntities = filterEntitiesByKeywords(
    entities,
    includedKeywords,
    excludedKeywords,
    currentRoom
  ).filter(
    (entity) => entity.entity_id.startsWith('number.') && entity.max > entity.min
  );


  const timeEntities = filterEntitiesByKeywords(
    entities,
    includedKeywords,
    excludedKeywords,
    currentRoom
  ).filter((entity) => entity.entity_id.startsWith('time.'));


  return (
    <div>
      {currentControl !== 'Home' ? (
        // Render components based on currentControl
        <></>
      ) : (
        <>

          {dropdownEntities.length > 0 && (
            <SelectCard entities={dropdownEntities} />
          )}
          {sliderEntities.length > 0 && (
            <SliderCard entities={sliderEntities} />
          )}
          {timeEntities.length > 0 && <TimeCard entities={timeEntities} />}
        </>
      )}

    </div>
  );
};

export default ControllCollection;
