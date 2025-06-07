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
    [`ogb_plantstage_${currentRoom.toLowerCase()}`]: 'Change to your current plant stage. Lights will be dimmed to new min/max if dimmable.',
    [`ogb_tentmode_${currentRoom.toLowerCase()}`]: 'Setting This starts the Controll based on mode check wiki what the modes does',
    [`ogb_holdvpdnight_${currentRoom.toLowerCase()}`]: 'Enable this if you want to controll the VPD on NightTime If not all devices will get a turn off on nighttime',
    [`ogb_dryingmodes_${currentRoom.toLowerCase()}`]: 'Select your Drying Technic make sure your Tent-Mode is set to Drying',
    [`ogb_workmode_${currentRoom.toLowerCase()}`]: 'Change to your current plant stage. Lights will be dimmed to new min/max if dimmable.',


    [`ogb_leaftemp_offset_${currentRoom.toLowerCase()}`]: 'This is your current LeafTemp if you need to connect a own overrite it with some automation with your value',
    [`ogb_vpdtarget_${currentRoom.toLowerCase()}`]: 'Set This to your TargetVPD - Works only with TentMode "Targeted VPD',
    [`ogb_vpdtolerance_${currentRoom.toLowerCase()}`]: 'Use this to seetting the tollerance betwen your Targeted VPD and your Perfection VPD',

    [`ogb_lightcontrol_${currentRoom.toLowerCase()}`]: 'Enable this if you want to controll the Lights over OGB',
    [`ogb_vpdlightcontrol_${currentRoom.toLowerCase()}`]: 'If this is Enabled your light will swtich between min/max from Stage to try better the VPD',

    [`ogb_lightontime_${currentRoom.toLowerCase()}`]: 'Set this to 20:00:00 or 20:00 depents on Browser to Start Light on 8PM, Works Only with Light Control Enabled',
    [`ogb_lightofftime_${currentRoom.toLowerCase()}`]: 'Set this to 08:00:00 or 08:00 depents on Browser to Stop Light on 8PM, Works Only with Light Control Enabled',

    [`ogb_sunrisetime_${currentRoom.toLowerCase()}`]: 'Set this to 00:30:00 or 30:00 depents on Browser to Start a SunRise Phase,Need Dimmable Lights "light.", Works Only with Light Control Enabled',
    [`ogb_sunsettime_${currentRoom.toLowerCase()}`]: 'Set this to 00:30:00 or 30:00 depents on Browser to Start a SunSet Phase,Need Dimmable Lights "light.", Works Only with Light Control Enabled',

    [`ogb_light_minmax_${currentRoom.toLowerCase()}`]: 'Enable to set your Own Min/Max Values Set Them First then Enable it',
    [`ogb_light_volt_min_${currentRoom.toLowerCase()}`]: 'Set your Min Voltage, "Light Min Max needs To be Enabled',
    [`ogb_light_volt_max_${currentRoom.toLowerCase()}`]: 'Set your Max Voltage, "Light Min Max needs To be Enabled',


    [`ogb_co2_control_${currentRoom.toLowerCase()}`]: 'Enable to Activate Diffrent Control Based On CO2',
    [`ogb_co2minvalue_${currentRoom.toLowerCase()}`]: 'Set your CO2 Min Value',
    [`ogb_co2maxvalue_${currentRoom.toLowerCase()}`]: 'Set your CO2 Max Value',
    [`ogb_co2targetvalue_${currentRoom.toLowerCase()}`]: 'Set your CO2 Target Value',


    [`ogb_ownweights_${currentRoom.toLowerCase()}`]: 'Enable This to set your own Weights based on Temp:Hum Default 1:1 on Mid and Late flower 1:1,25',
    [`ogb_minmax_control_${currentRoom.toLowerCase()}`]: 'If Enabled you can use your own Min/Max values for the controller',
    [`ogb_exhaust_minmax_${currentRoom.toLowerCase()}`]: 'Enable to set your Own Min/Max Values Set Them First then Enable it',
    [`ogb_ventilation_minmax_${currentRoom.toLowerCase()}`]: 'Enable to set your Own Min/Max Values Set Them First then Enable it',


    [`ogb_temperatureweight_${currentRoom.toLowerCase()}`]: 'Set Your Own Temp Weight, OWn weights needs to be Enabled',
    [`ogb_humidityweight_${currentRoom.toLowerCase()}`]: 'Set Your Own Humdidity Weight, OWn weights needs to be Enabled',
    [`ogb_mintemp_${currentRoom.toLowerCase()}`]: 'Set to Your own Min Temp, Min Max Control need to be Enabled',
    [`ogb_maxtemp_${currentRoom.toLowerCase()}`]: 'Set to Your own Max Temp, Min Max Control need to be Enabled',
    [`ogb_minhum_${currentRoom.toLowerCase()}`]: 'Set to Your own Min Humidity, Min Max Control need to be Enabled',
    [`ogb_maxhum_${currentRoom.toLowerCase()}`]: 'Set to Your own Max Humidity, Min Max Control need to be Enabled',

    [`ogb_exhaust_duty_max_${currentRoom.toLowerCase()}`]: 'Set to Your own Max DutyCycle,"Exhaust Min Max" need to be Enabled',
    [`ogb_exhaust_duty_min_${currentRoom.toLowerCase()}`]: 'Set to Your own Min DutyCycle, "Exhaust Min Max" need to be Enabled',
    [`ogb_ventilation_duty_max_${currentRoom.toLowerCase()}`]: 'Set to Your own Max DutyCycle,"Ventilation Min Max" need to be Enabled',
    [`ogb_ventilation_duty_min_${currentRoom.toLowerCase()}`]: 'Set to Your own Min DutyCycle, "Ventilation Min Max" need to be Enabled',

    [`ogb_hydro_mode_${currentRoom.toLowerCase()}`]: 'Activate this For Plant Watering or Hydro Setups, Plant-Watering is Default Allways Cycle True',
    [`ogb_hydro_cycle_${currentRoom.toLowerCase()}`]: 'If Enabled it will use The Duration-Time to Stay active and the Intervall to Pause until next Start',
    [`ogb_hydropumpduration_${currentRoom.toLowerCase()}`]: 'Set your Duration Time The Pump Stays Active, Works Only with Plant-Watering or Hydro & Cycle True',
    [`ogb_hydropumpintervall_${currentRoom.toLowerCase()}`]: 'Set your Intervall Time The Pump Waits for Next Action, Works Only with Plant-Watering or Hydro & Cycle True',


    [`ogb_owndevicesets_${currentRoom.toLowerCase()}`]: 'If enabled you can use The List bellow to map a Entitiy to an Device Type, Default The Naming Convention take action until you Enable "Own Device Sets"',
    [`ogb_light_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Light, Works only with "Own Devices Sets Enabled',    
    [`ogb_exhaust_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Exhaust, Works only with "Own Devices Sets Enabled',
    [`ogb_inhaust_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Inhaust, Works only with "Own Devices Sets Enabled',
    [`ogb_vents_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Ventilation, Works only with "Own Devices Sets Enabled',    
    [`ogb_humidifier_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Humidifier, Works only with "Own Devices Sets Enabled',
    [`ogb_dehumidifier_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Dehumidifier, Works only with "Own Devices Sets Enabled',
    [`ogb_heater_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Heater, Works only with "Own Devices Sets Enabled',
    [`ogb_cooler_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Cooler, Works only with "Own Devices Sets Enabled',
    [`ogb_climate_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Climate, Works only with "Own Devices Sets Enabled "NOT WOKING RIGHT NOW',
    [`ogb_waterpump_device_select_${currentRoom.toLowerCase()}`]: 'Select your Entiy as Water Pump, Works only with "Own Devices Sets Enabled',





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
