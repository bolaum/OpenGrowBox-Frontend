import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const LogItem = ({ room, date, info }) => (
  <LogItemContainer>
    <LogHeader>
      <RoomInfo>{room}</RoomInfo>
      <TimeStamp>{date}</TimeStamp>
    </LogHeader>
    <LogInfo>
      <pre>{typeof info === 'string' ? JSON.stringify(JSON.parse(info), null, 2) : JSON.stringify(info, null, 1)}</pre> 
    </LogInfo>
  </LogItemContainer>
);


const GrowLogs = () => {
  const [logs, setLogs] = useState([]);
  const { connection } = useHomeAssistant();

  useEffect(() => {
    if (!connection) return;

    const handleNewEvent = (event) => {

      const newLog = {
        room: event.data.Name,
        date: new Date(event.time_fired).toLocaleString(),
        info: JSON.stringify(event.data)
      };
      setLogs((prevLogs) => [newLog, ...prevLogs]);
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

  const displayedLogs = logs.slice(0, 100);

  return (
    <GrowLogContainer>

      {displayedLogs.length === 0 ? (
        <NoLogsMessage>Keine Logs vorhanden</NoLogsMessage>
      ) : (
        displayedLogs.map((log, index) => (
          <LogItem
            key={index}
            room={log.room || 'Unbekannt'}
            date={log.date}
            info={log.info}
          />
        ))
      )}
    </GrowLogContainer>
  );
};

export default GrowLogs;

const GrowLogContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.25rem;
  width: 100%;
  height: 100%;
  max-height:80vh;
  overflow-y: auto;
  padding: 1rem;

`;

const LogItemContainer = styled.div`
  display: flex;
  align-items:space-around;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1rem;

  border-radius: 1.5rem;
`;

const LogHeader = styled.div`
  display: flex;
  color: var(--primary-accent);
  padding:0.25rem;

  font-size: 0.7rem;
  font-weight: bold;
  border-bottom: 2px solid rgba(125, 125, 125, 0.7);
`;

const RoomInfo = styled.div`
  flex: 1;
  color: var(--primary-accent);
  font-size: 0.9rem;
`;

const LogInfo = styled.div`
  display: flex;
  align-items: center;
  padding-left: 1rem;
  font-size: 0.9rem;
  width: 100%;
  background: var(--main-bg-color);
  color:var(--main-text-color);
`;

const TimeStamp = styled.div`
  font-size: 0.9rem;
`;

const NoLogsMessage = styled.div`
  color: var(--second-text-color);
  font-size: 1rem;
  text-align: center;
  padding: 1rem;
`;
