import React, { useState } from 'react';
import SelectCard from './SelectCard';
import SliderCard from './SliderCard';
import SwitchCard from './SwitchCard';
import TimeCard from './TimeCard';
import { useHomeAssistant } from "../../Context/HomeAssistantContext";



const groupMappings = {
  'Main Control': {
    includeKeywords: ['vpd', 'plant', 'mode', 'leaf', 'ambient'],
    excludeKeywords: ['proportional', 'derivativ', 'integral', "light", "food", "days", "hydro", "Count", "Borrow", "ambient"],
  },
  "Lights": {
    includeKeywords: ['light', 'sun'],
    excludeKeywords: ['Device'],
  },
  'CO₂ Control': {
    includeKeywords: ['co2'],
    excludeKeywords: ["Device"],
  },
  "Hydro Settings": {
    includeKeywords: ['pump', 'water', 'Hydro'],
    excludeKeywords: ["Device"],
  },
  'Device Settings': {
    includeKeywords: ['device'],
    excludeKeywords: [],
  },
  "Targets": {
    includeKeywords: ['weight', 'min', 'max'],
    excludeKeywords: ['co2', "Light", "Inhaust"],
  },
  "Drying": {
    includeKeywords: ['drying'],
    excludeKeywords: [
      'device', 'vpd', 'temp', 'hum', 'co2', 'light',
      'sun', 'stage', 'plant', 'leaf', 'borrow', 'weigh',
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

  const entityTooltips = {
    [`ogb_plantstage_${currentRoom.toLowerCase()}`]: 'Set the current plant stage. Lights will adjust to the new min/max if dimmable.',
    [`ogb_tentmode_${currentRoom.toLowerCase()}`]: 'Select a grow mode to activate automated control. Check the wiki for detailed mode descriptions.',
    [`ogb_holdvpdnight_${currentRoom.toLowerCase()}`]: 'Enable to control VPD during nighttime. If disabled, all devices will turn off at night.',
    [`ogb_dryingmodes_${currentRoom.toLowerCase()}`]: 'Select your preferred drying technique. Make sure Tent Mode is set to "Drying".',
    [`ogb_workmode_${currentRoom.toLowerCase()}`]: 'Set the current plant stage. Lights will adjust to the new min/max if dimmable.',

    [`ogb_leaftemp_offset_${currentRoom.toLowerCase()}`]: 'Override the detected leaf temperature by automation if needed.',
    [`ogb_vpdtarget_${currentRoom.toLowerCase()}`]: 'Set your target VPD. Works only in "Targeted VPD" Tent Mode.',
    [`ogb_vpdtolerance_${currentRoom.toLowerCase()}`]: 'Adjust tolerance between Targeted VPD and Perfect VPD.',

    [`ogb_lightcontrol_${currentRoom.toLowerCase()}`]: 'Enable to control lights via OpenGrowBox.',
    [`ogb_vpdlightcontrol_${currentRoom.toLowerCase()}`]: 'If enabled, light intensity will shift between min/max to help regulate VPD.',

    [`ogb_lightontime_${currentRoom.toLowerCase()}`]: 'Set the time to turn on the lights (e.g. 20:00:00). Requires Light Control enabled.',
    [`ogb_lightofftime_${currentRoom.toLowerCase()}`]: 'Set the time to turn off the lights (e.g. 08:00:00). Requires Light Control enabled.',

    [`ogb_sunrisetime_${currentRoom.toLowerCase()}`]: 'Set sunrise phase duration (e.g. 00:30:00). Requires dimmable lights and Light Control.',
    [`ogb_sunsettime_${currentRoom.toLowerCase()}`]: 'Set sunset phase duration (e.g. 00:30:00). Requires dimmable lights and Light Control.',

    [`ogb_light_minmax_${currentRoom.toLowerCase()}`]: 'Enable to use custom min/max light voltage. Set values before enabling.',
    [`ogb_light_volt_min_${currentRoom.toLowerCase()}`]: 'Set the minimum voltage. Requires Light Min/Max enabled.',
    [`ogb_light_volt_max_${currentRoom.toLowerCase()}`]: 'Set the maximum voltage. Requires Light Min/Max enabled.',

    [`ogb_co2_control_${currentRoom.toLowerCase()}`]: 'Enable CO₂-based environmental control.',
    [`ogb_co2minvalue_${currentRoom.toLowerCase()}`]: 'Set minimum CO₂ value.',
    [`ogb_co2maxvalue_${currentRoom.toLowerCase()}`]: 'Set maximum CO₂ value.',
    [`ogb_co2targetvalue_${currentRoom.toLowerCase()}`]: 'Set target CO₂ value.',

    [`ogb_ownweights_${currentRoom.toLowerCase()}`]: 'Enable to define custom temperature/humidity weights (e.g. 1:1.25 in late flower).',
    [`ogb_minmax_control_${currentRoom.toLowerCase()}`]: 'Enable to set custom min/max values for controllers.',
    [`ogb_exhaust_minmax_${currentRoom.toLowerCase()}`]: 'Enable to set custom exhaust min/max values.',
    [`ogb_ventilation_minmax_${currentRoom.toLowerCase()}`]: 'Enable to set custom ventilation min/max values.',

    [`ogb_temperatureweight_${currentRoom.toLowerCase()}`]: 'Set custom temperature weight. Requires custom weights enabled.',
    [`ogb_humidityweight_${currentRoom.toLowerCase()}`]: 'Set custom humidity weight. Requires custom weights enabled.',
    [`ogb_mintemp_${currentRoom.toLowerCase()}`]: 'Set custom minimum temperature. Requires Min/Max Control enabled.',
    [`ogb_maxtemp_${currentRoom.toLowerCase()}`]: 'Set custom maximum temperature. Requires Min/Max Control enabled.',
    [`ogb_minhum_${currentRoom.toLowerCase()}`]: 'Set custom minimum humidity. Requires Min/Max Control enabled.',
    [`ogb_maxhum_${currentRoom.toLowerCase()}`]: 'Set custom maximum humidity. Requires Min/Max Control enabled.',

    [`ogb_exhaust_duty_max_${currentRoom.toLowerCase()}`]: 'Set custom max duty cycle for exhaust. Requires Exhaust Min/Max enabled.',
    [`ogb_exhaust_duty_min_${currentRoom.toLowerCase()}`]: 'Set custom min duty cycle for exhaust. Requires Exhaust Min/Max enabled.',
    [`ogb_ventilation_duty_max_${currentRoom.toLowerCase()}`]: 'Set custom max duty cycle for ventilation. Requires Ventilation Min/Max enabled.',
    [`ogb_ventilation_duty_min_${currentRoom.toLowerCase()}`]: 'Set custom min duty cycle for ventilation. Requires Ventilation Min/Max enabled.',

    [`ogb_hydro_mode_${currentRoom.toLowerCase()}`]: 'Enable for plant watering or hydro systems. Watering defaults to always cycling.',
    [`ogb_hydro_cycle_${currentRoom.toLowerCase()}`]: 'Enable to use interval and duration for water cycling.',
    [`ogb_hydropumpduration_${currentRoom.toLowerCase()}`]: 'Set how long the pump stays active. Requires Hydro Mode and cycling enabled.',
    [`ogb_hydropumpintervall_${currentRoom.toLowerCase()}`]: 'Set pump pause interval. Requires Hydro Mode and cycling enabled.',

    [`ogb_owndevicesets_${currentRoom.toLowerCase()}`]: 'Enable to manually map entities to device types. Default uses naming convention.',
    [`ogb_light_device_select_${currentRoom.toLowerCase()}`]: 'Select a light entity. Requires Own Device Sets enabled.',
    [`ogb_exhaust_device_select_${currentRoom.toLowerCase()}`]: 'Select an exhaust entity. Requires Own Device Sets enabled.',
    [`ogb_inhaust_device_select_${currentRoom.toLowerCase()}`]: 'Select an inhaust entity. Requires Own Device Sets enabled.',
    [`ogb_vents_device_select_${currentRoom.toLowerCase()}`]: 'Select a ventilation entity. Requires Own Device Sets enabled.',
    [`ogb_humidifier_device_select_${currentRoom.toLowerCase()}`]: 'Select a humidifier entity. Requires Own Device Sets enabled.',
    [`ogb_dehumidifier_device_select_${currentRoom.toLowerCase()}`]: 'Select a dehumidifier entity. Requires Own Device Sets enabled.',
    [`ogb_heater_device_select_${currentRoom.toLowerCase()}`]: 'Select a heater entity. Requires Own Device Sets enabled.',
    [`ogb_cooler_device_select_${currentRoom.toLowerCase()}`]: 'Select a cooler entity. Requires Own Device Sets enabled.',
    [`ogb_climate_device_select_${currentRoom.toLowerCase()}`]: 'Select a climate device. Requires Own Device Sets enabled. (Currently not working)',
    [`ogb_waterpump_device_select_${currentRoom.toLowerCase()}`]: 'Select a water pump entity. Requires Own Device Sets enabled.',
  };


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
        .map(([key, entity]) => {
          const cleanKey = entity.entity_id.split('.').pop(); // ✅ zuerst definieren
          const tooltip = entityTooltips[cleanKey] || '';     // ✅ dann verwenden

        console.log(cleanKey,tooltip)
        return {
          title: formatTitle(entity.attributes?.friendly_name || entity.entity_id),
          entity_id: entity.entity_id,
          attributes: entity.attributes || {},
          options: entity.attributes?.options || [],
          min: entity.attributes?.min || 0,
          max: entity.attributes?.max || 100,
          step: entity.attributes?.step || 1,
          state: entity?.state || 50,
          unit: entity.attributes?.unit_of_measurement || '',
          tooltip,
        };
      });
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

  const switchEntities = filterEntitiesByKeywords(
    entities,
    includedKeywords,
    excludedKeywords,
    currentRoom
  ).filter((entity) => entity.entity_id.startsWith('switch.'));

  return (
    <div>
      {currentControl !== 'Home' ? (
        // Render components based on currentControl
        <></>
      ) : (
        <>
          {switchEntities.length > 0 && (
            <SwitchCard entities={switchEntities} />
          )}
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
