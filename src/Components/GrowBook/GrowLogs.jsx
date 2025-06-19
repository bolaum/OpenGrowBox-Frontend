import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const LogItem = ({ room, date, info }) => {
  // Parse the info if it's a string
  const parsedInfo = typeof info === 'string' ? JSON.parse(info) : info;
  
  // Determine log type for styling
  const getLogType = (data) => {
    const msg = data.message?.toLowerCase() || '';
    const action = data.Action?.toLowerCase() || '';
    
    if (msg.includes('vpd')) return 'vpd';
    if (msg.includes('humidity')) return 'humidity';
    if (msg.includes('temperature')) return 'temperature';
    if (data.VPD !== undefined) return 'sensor';
    if (data.action) return 'action';
    // Check for pump/device actions
    if (data.Device || data.Action || data.Cycle !== undefined) return 'device';
    return 'default';
  };

  const logType = getLogType(parsedInfo);

  // Format sensor data nicely
  const formatSensorData = (data) => {
    if (data.VPD !== undefined) {
      return (
        <SensorGrid>
          <SensorItem>
            <SensorLabel>VPD</SensorLabel>
            <SensorValue>{data.VPD}</SensorValue>
          </SensorItem>
          <SensorItem>
            <SensorLabel>Temp</SensorLabel>
            <SensorValue>{data.AvgTemp}°C</SensorValue>
          </SensorItem>
          <SensorItem>
            <SensorLabel>Humidity</SensorLabel>
            <SensorValue>{data.AvgHum}%</SensorValue>
          </SensorItem>
          <SensorItem>
            <SensorLabel>Dew Point</SensorLabel>
            <SensorValue>{data.AvgDew}°C</SensorValue>
          </SensorItem>
        </SensorGrid>
      );
    }
    return null;
  };

  // Format device/pump actions
  const formatDeviceAction = (data) => {
    if (data.Device || data.Action) {
      const device = data.Device || 'Device';
      const action = data.Action || 'unknown';
      const cycle = data.Cycle;
      const message = data.Message || '';
      
      return (
        <DeviceActionContainer>
          <DeviceHeader>
            <DeviceIcon device={device}>
              {getDeviceIcon(device)}
            </DeviceIcon>
            <DeviceInfo>
              <DeviceName>{device}</DeviceName>
              {message && <DeviceMessage>{message}</DeviceMessage>}
            </DeviceInfo>
          </DeviceHeader>
          <DeviceDetails>
            <ActionBadge action={action}>{action}</ActionBadge>
            {cycle !== undefined && (
              <CycleIndicator cycle={cycle}>
                <CycleLabel>Cycle</CycleLabel>
                <CycleValue>{cycle ? 'ON' : 'OFF'}</CycleValue>
              </CycleIndicator>
            )}
          </DeviceDetails>
        </DeviceActionContainer>
      );
    }
    return null;
  };

  // Get device icon based on device type
  const getDeviceIcon = (device) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('pump') || deviceLower.includes('water')) return '💧';
    if (deviceLower.includes('fan') || deviceLower.includes('ventil')) return '🌪️';
    if (deviceLower.includes('exhaust') || deviceLower.includes('ventil')) return '🌪️';
    if (deviceLower.includes('light') || deviceLower.includes('led')) return '💡';
    if (deviceLower.includes('heat') || deviceLower.includes('warm')) return '🔥';
    if (deviceLower.includes('cool') || deviceLower.includes('ac')) return '❄️';
    return '⚙️';
  };

  // Format action data - handle both single actions and arrays of actions
  const formatActionData = (data) => {
    // Check if data is an array (multiple actions)
    if (Array.isArray(data)) {
      const actions = data.filter(item => item.action);
      if (actions.length > 0) {
        return (
          <MultiActionContainer>
            <ActionHeader>
              <ActionTitle>{data[0]?.message || 'Actions'}</ActionTitle>
              <ActionCount>{actions.length} Actions</ActionCount>
            </ActionHeader>
            <ActionGrid>
              {actions.map((action, index) => (
                <ActionItem key={index}>
                  <ActionBadge action={action.action}>{action.action}</ActionBadge>
                  <ActionCapability>{action.capability}</ActionCapability>
                   <DeviceIcon device={action.capability}>
                    {getDeviceIcon(action.capability)}
                  </DeviceIcon>
                </ActionItem>
              ))}
            </ActionGrid>
          </MultiActionContainer>
        );
      }
    }
    
    // Single action
    if (data.action) {
      return (
        <SingleActionContainer>
          <ActionBadge action={data.action}>{data.action}</ActionBadge>
          <ActionDetail>{data.capability}</ActionDetail>
        </SingleActionContainer>
      );
    }
    return null;
  };

  // Format deviation data
  const formatDeviationData = (data) => {
    if (data.tempDeviation !== undefined || data.humDeviation !== undefined) {
      return (
        <DeviationContainer>
          {data.tempDeviation !== undefined && (
            <DeviationItem deviation={data.tempDeviation}>
              <DeviationLabel>Temp Deviation</DeviationLabel>
              <DeviationValue>{data.tempDeviation > 0 ? '+' : ''}{data.tempDeviation}</DeviationValue>
            </DeviationItem>
          )}
          {data.humDeviation !== undefined && (
            <DeviationItem deviation={data.humDeviation}>
              <DeviationLabel>Hum Deviation</DeviationLabel>
              <DeviationValue>{data.humDeviation > 0 ? '+' : ''}{data.humDeviation}</DeviationValue>
            </DeviationItem>
          )}
        </DeviationContainer>
      );
    }
    return null;
  };

  const sensorData = formatSensorData(parsedInfo);
  const actionData = formatActionData(parsedInfo);
  const deviceData = formatDeviceAction(parsedInfo);
  const deviationData = formatDeviationData(parsedInfo);

  return (
    <LogItemContainer logType={logType}>
      <LogHeader logType={logType}>
        <RoomInfo>
          <RoomName>{room}</RoomName>
          {parsedInfo.message && <MessageText>{parsedInfo.message}</MessageText>}
        </RoomInfo>
        <TimeStamp>{date}</TimeStamp>
      </LogHeader>
      <LogContent>
        {sensorData && sensorData}
        {actionData && actionData}
        {deviceData && deviceData}
        {deviationData && deviationData}
        {!sensorData && !actionData && !deviceData && !deviationData && (
          <FallbackContent>
            <pre>{JSON.stringify(parsedInfo, null, 2)}</pre>
          </FallbackContent>
        )}
      </LogContent>
    </LogItemContainer>
  );
};

const GrowLogs = () => {
  const [logs, setLogs] = useState([]);
  const { connection } = useHomeAssistant();

  useEffect(() => {
    if (!connection) return;

    const handleNewEvent = (event) => {
      // Debug: Log the entire event structure
      console.log('Full event:', event);
      console.log('Event data:', event.data);
      
      // Try multiple ways to find the room name
      const findRoomName = (data) => {
        // Direct access
        if (data.Name) return data.Name;
        if (data.name) return data.name;
        if (data.room) return data.room;
        if (data.Room) return data.Room;
        
        // Search in arrays and nested objects
        const searchInStructure = (obj, depth = 0) => {
          if (depth > 5) return null; // Prevent infinite recursion
          
          // If it's an array, search each element
          if (Array.isArray(obj)) {
            for (const item of obj) {
              if (typeof item === 'object' && item !== null) {
                // Check direct properties first
                if (item.Name) return item.Name;
                if (item.name) return item.name;
                if (item.room) return item.room;
                if (item.Room) return item.Room;
                
                // Recursively search
                const result = searchInStructure(item, depth + 1);
                if (result) return result;
              }
            }
          }
          
          // If it's an object, search properties
          if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
              // Check if this key is what we're looking for
              if (key === 'Name' || key === 'name' || key === 'room' || key === 'Room') {
                return value;
              }
              
              // Recursively search nested structures
              if (typeof value === 'object' && value !== null) {
                const result = searchInStructure(value, depth + 1);
                if (result) return result;
              }
            }
          }
          
          return null;
        };
        
        return searchInStructure(data) || 'Unbekannt';
      };

      const roomName = findRoomName(event.data);
      
      // Enhanced debug logging
      if (roomName === 'Unbekannt') {
        console.warn('Could not find room name in event:', {
          eventData: event.data,
          dataType: typeof event.data,
          isArray: Array.isArray(event.data),
          keys: typeof event.data === 'object' ? Object.keys(event.data) : 'Not an object'
        });
      }
      
      const newLog = {
        room: roomName,
        date: new Date(event.time_fired).toLocaleString('de-DE'),
        info: JSON.stringify(event.data)
      };
      setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 199)]); // Keep only last 200 logs for performance
    };

    const subscribe = async () => {
      const unsubscribe = await connection.subscribeEvents(
        handleNewEvent,
        'LogForClient'
      );
      return unsubscribe;
    };

    const unsubscribePromise = subscribe();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [connection]);

  const displayedLogs = logs.slice(0, 50); // Show only 50 logs for better performance

  return (
    <LogContainer>
      <GrowLogContainer>
        {displayedLogs.length === 0 ? (
          <NoLogsMessage>
            <LoadingDots>Waiting for Logs...</LoadingDots>
          </NoLogsMessage>
        ) : (
          displayedLogs.map((log, index) => (
            <LogItem
              key={`${log.room}-${log.date}-${index}`}
              room={log.room || ''}
              date={log.date}
              info={log.info}
            />
          ))
        )}
      </GrowLogContainer>
    </LogContainer>
  );
};

export default GrowLogs;

// Styled Components

const LogContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const GrowLogContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  
  @media (max-width: 1200px) {
    width: 350px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    height: 100%;
    max-height: none;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-accent);
    border-radius: 4px;
    
    &:hover {
      background: var(--primary-accent-hover, var(--primary-accent));
    }
  }
`;

const LogItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => {
    switch(props.logType) {
      case 'sensor': return 'linear-gradient(135deg, rgba(34, 193, 195, 0.1) 0%, rgba(253, 187, 45, 0.1) 100%)';
      case 'action': return 'linear-gradient(135deg, rgba(255, 94, 77, 0.1) 0%, rgba(255, 154, 0, 0.1) 100%)';
      case 'device': return 'linear-gradient(135deg, rgba(116, 75, 162, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)';
      case 'vpd': return 'linear-gradient(135deg, rgba(131, 58, 180, 0.1) 0%, rgba(253, 29, 29, 0.1) 100%)';
      case 'humidity': return 'linear-gradient(135deg, rgba(45, 134, 255, 0.1) 0%, rgba(45, 253, 159, 0.1) 100%)';
      case 'temperature': return 'linear-gradient(135deg, rgba(255, 94, 77, 0.1) 0%, rgba(255, 203, 95, 0.1) 100%)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: fit-content;
  flex-shrink: 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-accent);
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const RoomName = styled.div`
  color: var(--primary-accent);
  font-size: 1rem;
  font-weight: 600;
`;

const MessageText = styled.div`
  color: var(--main-text-color);
  font-size: 0.85rem;
  opacity: 0.8;
`;

const TimeStamp = styled.div`
  color: var(--second-text-color);
  font-size: 0.75rem;
  white-space: nowrap;
  margin-left: 1rem;
`;

const LogContent = styled.div`
  padding: 1rem 1.25rem 1.25rem;
`;

// Device Action Styles
const DeviceActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DeviceIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => {
    const device = props.device?.toLowerCase() || '';
    if (device.includes('pump') || device.includes('mist')) return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
    if (device.includes('fan')) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (device.includes('light')) return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
    return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const DeviceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const DeviceName = styled.div`
  color: var(--main-text-color);
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const DeviceMessage = styled.div`
  color: var(--second-text-color);
  font-size: 0.85rem;
  opacity: 0.8;
`;

const DeviceDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CycleIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const CycleLabel = styled.div`
  color: var(--second-text-color);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const CycleValue = styled.div`
  color: ${props => props.children === 'ON' ? '#4ecdc4' : '#ff6b6b'};
  font-size: 0.9rem;
  font-weight: 600;
`;

// Existing styles continue...
const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const SensorItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SensorLabel = styled.div`
  color: var(--second-text-color);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const SensorValue = styled.div`
  color: var(--primary-accent);
  font-size: 1.1rem;
  font-weight: 600;
`;

const MultiActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionTitle = styled.div`
  color: var(--main-text-color);
  font-size: 1rem;
  font-weight: 600;
`;

const ActionCount = styled.div`
  color: var(--primary-accent);
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const SingleActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionBadge = styled.div`
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: ${props => {
    switch(props.action?.toLowerCase()) {
      case 'reduce': 
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
      case 'increase': 
        return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
      case 'maintain': 
        return 'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)';
      case 'start':
        return 'linear-gradient(135deg, #96c93d 0%, #02aab0 100%)';
      case 'stop':
        return 'linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)';
      case 'on':
        return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
      case 'off':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
      default: 
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const ActionDetail = styled.div`
  color: var(--main-text-color);
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ActionCapability = styled.div`
  color: var(--second-text-color);
  font-size: 0.85rem;
  flex: 1;
`;

const DeviationContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DeviationItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: ${props => 
    props.deviation > 0 
      ? 'rgba(255, 107, 107, 0.1)' 
      : props.deviation < 0 
        ? 'rgba(74, 144, 226, 0.1)'
        : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => 
    props.deviation > 0 
      ? 'rgba(255, 107, 107, 0.3)' 
      : props.deviation < 0 
        ? 'rgba(74, 144, 226, 0.3)'
        : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  min-width: 120px;
`;

const DeviationLabel = styled.div`
  color: var(--second-text-color);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const DeviationValue = styled.div`
  color: ${props => 
    props.children?.toString().includes('+') 
      ? '#ff6b6b' 
      : props.children?.toString().includes('-')
        ? '#4a90e2'
        : 'var(--primary-accent)'
  };
  font-size: 1.1rem;
  font-weight: 600;
`;

const FallbackContent = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--main-text-color);
  overflow-x: auto;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
`;

const NoLogsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--second-text-color);
  font-size: 1.1rem;
`;

const LoadingDots = styled.div`
  &::after {
    content: '';
    animation: dots 2s infinite;
  }
  
  @keyframes dots {
    0%, 20% { content: ''; }
    25%, 45% { content: '.'; }
    50%, 70% { content: '..'; }
    75%, 95% { content: '...'; }
  }
`;