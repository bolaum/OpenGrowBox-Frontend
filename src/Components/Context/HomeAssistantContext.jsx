import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
} from 'home-assistant-js-websocket';

import { useGlobalState } from './GlobalContext';

const HomeAssistantContext = createContext();

function convertWsToHttp(wsUrl) {
  try {
    const url = new URL(wsUrl);
    // Ändern Sie das Protokoll von 'ws:' oder 'wss:' zu 'http:' bzw. 'https:'
    url.protocol = url.protocol === 'ws:' ? 'http:' : 'https:';
    // Entfernen Sie den Pfad '/api/websocket'
    url.pathname = '';
    return url.toString().replace(/\/$/, ''); // Entfernt den abschließenden '/'
  } catch (error) {
    console.error('Ungültige WebSocket-URL:', error);
    return null;
  }
}


export const HomeAssistantProvider = ({ children }) => {
  const {getHASS,getDeep} = useGlobalState()

  const [entities, setEntities] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('');
  const [roomOptions, setCurrentRoomOptions] = useState([]);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [srvAddr, setSrvAddr] = useState("")

  let baseUrl = getDeep("Conf.hassServer")
  const token = getDeep('Conf.haToken');
  const stateURL = `${baseUrl}/api/states`;

  useEffect(() => {
    let isMounted = true;
    let wsConnection = null;
    let reconnectTimeout = null;
    let retryDelay = 1000;

    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine && !wsConnection?.connected) {
        connect();
      }
    };

    const scheduleReconnect = () => {
      if (!isMounted) return;
      clearTimeout(reconnectTimeout);
      retryDelay = Math.min(retryDelay * 2, 30000);
      reconnectTimeout = setTimeout(() => {
        console.log(`Reconnecting in ${retryDelay}ms...`);
        connect();
      }, retryDelay);
    };

    const setupConnection = async (conn) => {
      try {
        const unsubscribeEntities = subscribeEntities(conn, (updatedEntities) => {
          if (isMounted) setEntities(updatedEntities);
        });

        const response = await fetch(stateURL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('API Error');
        const initialEntities = await response.json();

        if (isMounted) {
          setEntities(
            initialEntities.reduce((acc, entity) => ({ ...acc, [entity.entity_id]: entity }), {})
          );
          const roomEntity = initialEntities.find(e => e.entity_id === 'select.ogb_rooms');
          if (roomEntity) {
            setCurrentRoom(roomEntity.state);
            setCurrentRoomOptions(roomEntity.attributes.options || []);
          }
        }

        conn.addEventListener('ready', () => {
          if (isMounted) {
            console.log('Connected ✅');
            setError(null);
            retryDelay = 1000;
          }
        });

        conn.addEventListener('disconnected', () => {
          if (isMounted) {
            console.warn('Disconnected ❌');
            scheduleReconnect();
          }
        });
        
       // conn.subscribeEvents((event) => {
       //   console.log('Empfangenes Ereignis:', event);
       // }, 'state_changed').then((unsubscribe) => {
       //   // Speichern Sie 'unsubscribe', um das Abonnement später zu beenden
       // });

        return () => unsubscribeEntities();
      } catch (err) {
        if (isMounted) setError(err.message);
        scheduleReconnect();
      }
    };

    const connect = async () => {
      if (!isMounted || !isOnline) return;
    
      try {
        setLoading(true);
        const auth = createLongLivedTokenAuth(baseUrl, token);
        const newConnection = await createConnection({ 
          auth,
          setupRetry: 0 
        });
    
        if (!isMounted) {
          newConnection.close();
          return;
        }
    
        wsConnection = newConnection;
        setConnection(newConnection);
        await setupConnection(newConnection);
    
      } catch (err) {
        if (isMounted) setError(err.message);
        console.error("Failed to connect to Home Assistant WebSocket:", err.message);
        scheduleReconnect();
      } finally {
        if (isMounted) setLoading(false);
        if (wsConnection === null) return;
        console.log("✅ Connected to Home Assistant WebSocket", wsConnection);
      }
    };
    

    if (token && isOnline) connect();

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      clearTimeout(reconnectTimeout);
      if (wsConnection) {
        wsConnection.close();
        console.log('Connection closed 🧹');
      }
    };
  }, [token, isOnline]);

  useEffect(() => {
    if (entities['select.ogb_rooms']?.state !== currentRoom) {
      setCurrentRoom(entities['select.ogb_rooms']?.state || '');
    }
  }, [entities, currentRoom]);

  return (
    <HomeAssistantContext.Provider
      value={{ 
        entities, 
        connection, 
        loading, 
        error, 
        currentRoom, 
        setCurrentRoom,
        roomOptions, 
        setCurrentRoomOptions,
        isOnline,
        srvAddr,
      }}
    >
      {children}
    </HomeAssistantContext.Provider>
  );
};

export default HomeAssistantProvider;

export const useHomeAssistant = () => useContext(HomeAssistantContext);
