import{ createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
} from 'home-assistant-js-websocket';

import { useGlobalState } from './GlobalContext';

const HomeAssistantContext = createContext();

export const HomeAssistantProvider = ({ children }) => {
  const { getDeep } = useGlobalState();

  // State declarations
  const [entities, setEntities] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [roomOptions, setRoomOptions] = useState([]);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [srvAddr, setSrvAddr] = useState("");

  // Refs for managing connections and cleanup
  const unsubscribeRef = useRef(null);
  const wsConnectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const retryDelayRef = useRef(1000);
  const connectAttemptRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Configuration
  const baseUrl = getDeep("Conf.hassServer") || '';
  const token = getDeep('Conf.haToken') || '';
  const stateURL = baseUrl ? `${baseUrl}/api/states` : '';

  // Handle reconnection with exponential backoff
  const scheduleReconnect = () => {
    if (!isMountedRef.current) return;
    
    // Clear any existing reconnect timeout
    clearTimeout(reconnectTimeoutRef.current);
    
    // Increment attempt counter and check if we've reached the limit
    connectAttemptRef.current += 1;
    
    if (connectAttemptRef.current > MAX_RECONNECT_ATTEMPTS) {
      console.warn(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`);
      setError(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please refresh the page.`);
      return;
    }
    
    // Calculate delay with exponential backoff
    retryDelayRef.current = Math.min(retryDelayRef.current * 1.5, 30000);
    
    // Schedule reconnection
    console.log(`Reconnecting in ${retryDelayRef.current}ms... (Attempt ${connectAttemptRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) connect(true);
    }, retryDelayRef.current);
  };

  // Extract setup logic to a separate function for better organization
  const setupConnection = async (conn) => {
    if (!conn || !isMountedRef.current) return;

    try {
      // Clean up any existing subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Set up new entity subscription
      const unsubscribe = subscribeEntities(conn, (updatedEntities) => {
        if (isMountedRef.current) setEntities(updatedEntities);
      });
      unsubscribeRef.current = unsubscribe;

      // Fetch initial entities via REST API as a fallback
      if (stateURL) {
        try {
          const response = await fetch(stateURL, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) throw new Error(`API Error: ${response.status}`);
          
          const initialEntities = await response.json();
          
          if (isMountedRef.current) {
            // Convert array to object format
            const entitiesObj = initialEntities.reduce(
              (acc, entity) => ({ ...acc, [entity.entity_id]: entity }), 
              {}
            );
            setEntities(entitiesObj);
            
            // Extract room and token information
            const roomEntity = initialEntities.find(e => e.entity_id === 'select.ogb_rooms');
            const tokenEntity = initialEntities.find(e => e.entity_id === 'text.ogb_accesstoken');
            
            if (roomEntity) {
              setCurrentRoom(roomEntity.state || '');
              setRoomOptions(
                (roomEntity.attributes?.options || []).filter(
                  r => r.toLowerCase() !== "ambient"
                )
              );

            }
            
            if (tokenEntity) {
              setAccessToken(tokenEntity.state || '');
            }
          }
        } catch (err) {
          console.error("Failed to fetch initial entities:", err);
          // Don't throw here, we still have the WebSocket connection
        }
      }

      // Set up connection event listeners
      conn.addEventListener('ready', () => {
        if (isMountedRef.current) {
          console.log('Home Assistant connection ready ✅');
          setError(null);
          retryDelayRef.current = 1000;
          connectAttemptRef.current = 0;
        }
      });

      conn.addEventListener('disconnected', () => {
        if (isMountedRef.current) {
          console.warn('Home Assistant disconnected ❌');
          wsConnectionRef.current = null;
          scheduleReconnect();
        }
      });

      // Handle connection errors
      conn.addEventListener('error', (err) => {
        if (isMountedRef.current) {
          console.error('Home Assistant connection error:', err);
          setError(`Connection error: ${err.message || 'Unknown error'}`);
        }
      });

    } catch (err) {
      console.error("Error in setupConnection:", err);
      if (isMountedRef.current) setError(`Setup error: ${err.message || 'Unknown error'}`);
      throw err; // Re-throw to be handled by caller
    }
  };

  // Connection function - declaring before use
  const connect = async (force = false) => {
    if (!isMountedRef.current || (!isOnline && !force)) return;
    if (!baseUrl || !token) {
      console.warn("Missing baseUrl or token, cannot connect");
      setLoading(false);
      return;
    }

    // Clear any pending reconnection
    clearTimeout(reconnectTimeoutRef.current);

    try {
      setLoading(true);
      
      // Create auth object and connection with proper error handling
      const auth = createLongLivedTokenAuth(baseUrl, token);
      
      let newConnection;
      try {
        newConnection = await createConnection({
          auth,
          setupRetry: 0
        });
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        throw err; // Re-throw to be caught by outer try/catch
      }

      if (!isMountedRef.current) {
        // Component unmounted during connection attempt
        newConnection.close();
        return;
      }

      // Reset reconnection attempts on successful connection
      connectAttemptRef.current = 0;
      retryDelayRef.current = 1000;
      
      // Store connection references
      wsConnectionRef.current = newConnection;
      setConnection(newConnection);
      
      // Set up entity subscription with error handling
      try {
        await setupConnection(newConnection);
      } catch (err) {
        console.error("Failed to set up entity subscription:", err);
        throw err; // Re-throw to be caught by outer try/catch
      }
      
      setError(null);
      console.log("✅ Connected to Home Assistant WebSocket");
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError(err.message || "Connection failed");
      console.error("Failed to connect to Home Assistant:", err);
      
      // Close any partial connection
      if (wsConnectionRef.current) {
        try {
          wsConnectionRef.current.close();
        } catch (e) {
          console.warn("Error closing partial connection:", e);
        }
        wsConnectionRef.current = null;
      }
      
      // Schedule reconnect with backoff
      scheduleReconnect();
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online && !wsConnectionRef.current) {
        console.log("Network is online, attempting to reconnect");
        connect();
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [connection]);

  // Main connection effect
  useEffect(() => {
    isMountedRef.current = true;

    // Attempt initial connection if we have credentials and are online
    if (token && baseUrl && isOnline) {
      connect();
    } else {
      setLoading(false);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear any pending reconnection attempts
      clearTimeout(reconnectTimeoutRef.current);

      // Unsubscribe from entity updates
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {
          console.warn("Error during unsubscribe:", e);
        }
        unsubscribeRef.current = null;
      }

      // Close WebSocket connection
      if (wsConnectionRef.current) {
        try {
          wsConnectionRef.current.close();
        } catch (e) {
          console.warn("Error closing connection:", e);
        }
        wsConnectionRef.current = null;
        console.log('Home Assistant connection closed 🧹');
      }
    };
  }, [token, baseUrl, isOnline]);

  // Update current room from entities when they change
  useEffect(() => {
    const roomEntity = entities['select.ogb_rooms'];
    if (roomEntity && roomEntity.state !== currentRoom) {
      setCurrentRoom(roomEntity.state || '');
      
      // Also update room options if available
      if (roomEntity.attributes?.options) {
        setRoomOptions(roomEntity.attributes.options);
      }
    }
  }, [entities, currentRoom]);

  // Provide context values
  return (
    <HomeAssistantContext.Provider
      value={{
        connection,
        loading,
        error,
        entities,
        currentRoom,
        setCurrentRoom,
        roomOptions,
        setRoomOptions,
        isOnline,
        srvAddr,
        accessToken,
        setAccessToken,
        reconnect: () => {
          connectAttemptRef.current = 0;
          retryDelayRef.current = 1000;
          connect(true);
        }
      }}
    >
      {children}
    </HomeAssistantContext.Provider>
  );
};

export default HomeAssistantProvider;

export const useHomeAssistant = () => useContext(HomeAssistantContext);