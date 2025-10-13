import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import SelectCard from './SelectCard';
import SliderCard from './SliderCard';
import SwitchCard from './SwitchCard';
import TimeCard from './TimeCard';
import { useHomeAssistant } from "../../Context/HomeAssistantContext";

const capabilities = [
  'canHumidify',
  'canDehumidify',
  'canHeat',
  'canCool',
  'canExhaust',
  'canIntake',
  'canVentilate',
  'canLight',
  'canCO2',
  'canClimate',
];

const groupMappings = {
  'Main Control': {
    includeKeywords: ['vpd', 'plant', 'mode', 'leaf', 'ambient',"area"],
    excludeKeywords: ['proportional', 'derivativ', 'integral', "light", "food", "days", "hydro", "Count", "Borrow", 'cooldown'],
  },
  "Lights": {
    includeKeywords: ['light', 'sun'],
    excludeKeywords: ['Device', 'cooldown'],
  },
  'CO₂ Control': {
    includeKeywords: ['co2'],
    excludeKeywords: ["Device", 'cooldown'],
  },
  "Hydro Settings": {
    includeKeywords: ['pump', 'water', 'Hydro'],
    excludeKeywords: ["Device","feed","nutrient", 'cooldown'],
  },
  "Feed Settings": {
    includeKeywords: ['pump', "feed","nutrient",],
    excludeKeywords: ["Device","water","hydro", 'cooldown'],
  },
  'Special Settings': {
    includeKeywords: ['cooldown'],
    excludeKeywords: [],
  },
  "Targets": {
    includeKeywords: ['weight', 'min', 'max'],
    excludeKeywords: ['co2', "Light", "Inhaust", 'cooldown'],
  },
  "Drying": {
    includeKeywords: ['drying'],
    excludeKeywords: [
      'device', 'vpd', 'temp', 'hum', 'co2', 'light',
      'sun', 'stage', 'plant', 'leaf', 'borrow', 'weigh',
      'cooldown'
    ],
  },
};

const LOCK_STORAGE_KEY = 'ogb-controls-locked';

const ControllCollection = ({ option }) => {
  const { entities, currentRoom } = useHomeAssistant();
  const [isLocked, setIsLocked] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const lowerRoom = currentRoom ? currentRoom.toLowerCase() : '';
  const roomPattern = currentRoom ? new RegExp(`${currentRoom}$`, 'i') : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMatchChange = (event) => {
      setIsMobile(event.matches);
    };

    // Initialize with the current state
    handleMatchChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMatchChange);
    } else {
      mediaQuery.addListener(handleMatchChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMatchChange);
      } else {
        mediaQuery.removeListener(handleMatchChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isMobile) {
      setIsLocked(false);
      return;
    }

    const storedValue = window.localStorage.getItem(LOCK_STORAGE_KEY);
    if (storedValue === null) {
      setIsLocked(true);
    } else {
      setIsLocked(storedValue !== 'false');
    }
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return;
    window.localStorage.setItem(LOCK_STORAGE_KEY, String(isLocked));
  }, [isLocked, isMobile]);

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const lockStatusText = isLocked ? 'Controls locked' : 'Controls unlocked';
  const lockStatusHint = isLocked
    ? 'Unlock before changing values. This helps avoid accidental taps on mobile.'
    : 'Relock when you finish adjusting settings to keep mobile interactions safe.';
  const effectiveLock = isMobile ? isLocked : false;

  const entityTooltips = {
    [`ogb_plantstage_${lowerRoom}`]: 'Set the current plant stage. Lights will adjust to the new min/max if dimmable.',
    [`ogb_tentmode_${lowerRoom}`]: 'Select a grow mode to activate automated control. Check the wiki for detailed mode descriptions.',
    [`ogb_holdvpdnight_${lowerRoom}`]: 'Enable to control VPD during nighttime. If disabled, all devices will turn off at night.',
    [`ogb_dryingmodes_${lowerRoom}`]: 'Select your preferred drying technique. Make sure Tent Mode is set to "Drying".',
    [`ogb_workmode_${lowerRoom}`]: 'Set the current plant stage. Lights will adjust to the new min/max if dimmable.',

    [`ogb_leaftemp_offset_${lowerRoom}`]: 'Override the detected leaf temperature by automation if needed.',
    [`ogb_vpdtarget_${lowerRoom}`]: 'Set your target VPD. Works only in "Targeted VPD" Tent Mode.',
    [`ogb_vpdtolerance_${lowerRoom}`]: 'Adjust tolerance between Targeted VPD and Perfect VPD.',

    [`ogb_lightcontrol_${lowerRoom}`]: 'Enable to control lights via OpenGrowBox.',
    [`ogb_vpdlightcontrol_${lowerRoom}`]: 'If enabled, light intensity will shift between min/max to help regulate VPD.',

    [`ogb_lightontime_${lowerRoom}`]: 'Set the time to turn on the lights (e.g. 20:00:00). Requires Light Control enabled.',
    [`ogb_lightofftime_${lowerRoom}`]: 'Set the time to turn off the lights (e.g. 08:00:00). Requires Light Control enabled.',

    [`ogb_sunrisetime_${lowerRoom}`]: 'Set sunrise phase duration (e.g. 00:30:00). Requires dimmable lights and Light Control.',
    [`ogb_sunsettime_${lowerRoom}`]: 'Set sunset phase duration (e.g. 00:30:00). Requires dimmable lights and Light Control.',

    [`ogb_light_minmax_${lowerRoom}`]: 'Enable to use custom min/max light voltage. Set values before enabling.',
    [`ogb_light_volt_min_${lowerRoom}`]: 'Set the minimum voltage. Requires Light Min/Max enabled.',
    [`ogb_light_volt_max_${lowerRoom}`]: 'Set the maximum voltage. Requires Light Min/Max enabled.',

    [`ogb_co2_control_${lowerRoom}`]: 'Enable CO₂-based environmental control.',
    [`ogb_co2minvalue_${lowerRoom}`]: 'Set minimum CO₂ value.',
    [`ogb_co2maxvalue_${lowerRoom}`]: 'Set maximum CO₂ value.',
    [`ogb_co2targetvalue_${lowerRoom}`]: 'Set target CO₂ value.',

    [`ogb_ownweights_${lowerRoom}`]: 'Enable to define custom temperature/humidity weights (e.g. 1:1.25 in late flower).',
    [`ogb_minmax_control_${lowerRoom}`]: 'Enable to set custom min/max values for controllers.',
    [`ogb_exhaust_minmax_${lowerRoom}`]: 'Enable to set custom exhaust min/max values.',
    [`ogb_intake_minmax_${lowerRoom}`]: 'Enable to set custom intake min/max values.',
    [`ogb_ventilation_minmax_${lowerRoom}`]: 'Enable to set custom ventilation min/max values.',

    [`ogb_temperatureweight_${lowerRoom}`]: 'Set custom temperature weight. Requires custom weights enabled.',
    [`ogb_humidityweight_${lowerRoom}`]: 'Set custom humidity weight. Requires custom weights enabled.',
    [`ogb_mintemp_${lowerRoom}`]: 'Set custom minimum temperature. Requires Min/Max Control enabled.',
    [`ogb_maxtemp_${lowerRoom}`]: 'Set custom maximum temperature. Requires Min/Max Control enabled.',
    [`ogb_minhum_${lowerRoom}`]: 'Set custom minimum humidity. Requires Min/Max Control enabled.',
    [`ogb_maxhum_${lowerRoom}`]: 'Set custom maximum humidity. Requires Min/Max Control enabled.',

    [`ogb_exhaust_duty_max_${lowerRoom}`]: 'Set custom max duty cycle for exhaust. Requires Exhaust Min/Max enabled.',
    [`ogb_exhaust_duty_min_${lowerRoom}`]: 'Set custom min duty cycle for exhaust. Requires Exhaust Min/Max enabled.',
    [`ogb_intake_duty_max_${lowerRoom}`]: 'Set custom max duty cycle for intake. Requires Exhaust Min/Max enabled.',
    [`ogb_intake_duty_min_${lowerRoom}`]: 'Set custom min duty cycle for intake. Requires Exhaust Min/Max enabled.',

    [`ogb_ventilation_duty_max_${lowerRoom}`]: 'Set custom max duty cycle for ventilation. Requires Ventilation Min/Max enabled.',
    [`ogb_ventilation_duty_min_${lowerRoom}`]: 'Set custom min duty cycle for ventilation. Requires Ventilation Min/Max enabled.',

    [`ogb_hydro_mode_${lowerRoom}`]: 'Enable for plant watering or hydro systems. Watering defaults to always cycling.',
    [`ogb_hydro_cycle_${lowerRoom}`]: 'Enable to use interval and duration for water cycling.',
    [`ogb_hydropumpduration_${lowerRoom}`]: 'Set how long the pump stays active. Requires Hydro Mode and cycling enabled.',
    [`ogb_hydropumpintervall_${lowerRoom}`]: 'Set pump pause interval. Requires Hydro Mode and cycling enabled.',

    [`ogb_hydro_retrive_${lowerRoom}`]: 'Enable for Retrive Water System.',
    [`ogb_hydroretriveintervall_${lowerRoom}`]: 'Set pump pause interval for Retrive.',
    [`ogb_hydroretriveduration_${lowerRoom}`]: 'Set how long the pump stays active in Retrive',

    [`ogb_feed_plan_${lowerRoom}`]: 'Select your tank Feed/Plant Feed plan',

    [`ogb_feed_ec_target_${lowerRoom}`]: 'Set your EC Target',
    [`ogb_feed_ph_target_${lowerRoom}`]: 'Set your PH Target',
    [`ogb_feed_tolerance_ec_${lowerRoom}`]: 'Set your EC Tolerance in %',
    [`ogb_feed_tolerance_ph_${lowerRoom}`]: 'Set your PH Tolerance in %',

    [`ogb_feed_nutrient_a_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_b_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_c_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_w_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_x_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_y_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',
    [`ogb_feed_nutrient_ph_${lowerRoom}`]: 'Set your Pump ML value it Provides on x/ML',

    [`ogb_owndevicesets_${lowerRoom}`]: 'Enable to manually map entities to device types. Default uses naming convention.',
    [`ogb_light_device_select_${lowerRoom}`]: 'Select a light entity. Requires Own Device Sets enabled.',
    [`ogb_exhaust_device_select_${lowerRoom}`]: 'Select an exhaust entity. Requires Own Device Sets enabled.',
    [`ogb_intake_device_select_${lowerRoom}`]: 'Select an intake entity. Requires Own Device Sets enabled.',
    [`ogb_vents_device_select_${lowerRoom}`]: 'Select a ventilation entity. Requires Own Device Sets enabled.',
    [`ogb_humidifier_device_select_${lowerRoom}`]: 'Select a humidifier entity. Requires Own Device Sets enabled.',
    [`ogb_dehumidifier_device_select_${lowerRoom}`]: 'Select a dehumidifier entity. Requires Own Device Sets enabled.',
    [`ogb_heater_device_select_${lowerRoom}`]: 'Select a heater entity. Requires Own Device Sets enabled.',
    [`ogb_cooler_device_select_${lowerRoom}`]: 'Select a cooler entity. Requires Own Device Sets enabled.',
    [`ogb_climate_device_select_${lowerRoom}`]: 'Select a climate device. Requires Own Device Sets enabled. (Currently not working)',
    [`ogb_waterpump_device_select_${lowerRoom}`]: 'Select a water pump entity. Requires Own Device Sets enabled.',

    [`ogb_grow_area_m2_${lowerRoom}`]: 'Enter your m2 Space where you growing in',
    [`ogb_ambientcontrol_${lowerRoom}`]: 'Will be take care of the state of your Ambient( "NOT WORKING RIGHT NOW")',
    [`ogb_vpd_devicedampening_${lowerRoom}`]: 'Enable Device Cooldowns for any device see Wiki to check the cooldowns.',

    ...capabilities.reduce((acc, cap) => {
      acc[`ogb_cooldown_${cap.toLowerCase()}_${lowerRoom}`] = `Set cooldown time for "${cap.replace('can', '').toLowerCase()}" ` +
        `capability. Requires VPD Device Dampening enabled.`;
      return acc;
    }, {}),
  };


  const group = groupMappings[option];
  const includedKeywords = group ? group.includeKeywords : [];
  const excludedKeywords = group ? group.excludeKeywords : [];

  const formatTitle = (title) => {
    const normalizedTitle = title
      .replace(/^OGB_/, '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
    const withoutRoom = roomPattern ? normalizedTitle.replace(roomPattern, '') : normalizedTitle;
    const cleaned = withoutRoom.replace(/\s+/g, ' ').trim();
    return cleaned
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filterEntitiesByKeywords = (
    entities,
    includeKeywords,
    excludeKeywords,
    currentRoom
  ) => {
    const normalizedRoom = currentRoom ? currentRoom.toLowerCase() : '';

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
        const roomMatches = normalizedRoom
          ? lowerKey.includes(normalizedRoom)
          : true;
        return matchesInclude && !matchesExclude && roomMatches;
      })
      .map(([, entity]) => {
        const cleanKey = entity.entity_id.split('.').pop();
        const tooltip = entityTooltips[cleanKey] || '';

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
    <Wrapper>
      {isMobile && (
        <LockHeader>
          <LockCopy>
            <LockStatus $isLocked={isLocked}>{lockStatusText}</LockStatus>
            <LockHint>{lockStatusHint}</LockHint>
          </LockCopy>
          <LockButton
            type="button"
            onClick={handleToggleLock}
            $isLocked={isLocked}
            aria-pressed={isLocked}
            aria-label={
              isLocked
                ? 'Unlock controls to enable editing'
                : 'Lock controls to prevent accidental changes'
            }
          >
            {isLocked ? 'Unlock controls' : 'Lock controls'}
          </LockButton>
        </LockHeader>
      )}

      {switchEntities.length > 0 && (
        <SwitchCard entities={switchEntities} isLocked={effectiveLock} />
      )}
      {dropdownEntities.length > 0 && (
        <SelectCard entities={dropdownEntities} isLocked={effectiveLock} />
      )}
      {sliderEntities.length > 0 && (
        <SliderCard entities={sliderEntities} isLocked={effectiveLock} />
      )}
      {timeEntities.length > 0 && (
        <TimeCard entities={timeEntities} isLocked={effectiveLock} />
      )}
    </Wrapper>
  );
};

export default ControllCollection;

ControllCollection.propTypes = {
  option: PropTypes.string.isRequired,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LockHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(13, 17, 23, 0.65);
  backdrop-filter: blur(14px);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const LockCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LockStatus = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => (props.$isLocked ? '#f59f00' : '#51cf66')};
`;

const LockHint = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
`;

const LockButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  background: ${(props) => (props.$isLocked ? 'linear-gradient(135deg, #4c6ef5, #7b9cff)' : 'linear-gradient(135deg, #2b8a3e, #51cf66)')};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
  }
`;
