import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalStateContext = createContext();


const initialState = {
  Conf: {
    haToken: null,
    hass:null,
  },
  Controls: {
    isSidebarLeftOpen: false,
    deviceControl: false,
    Notification:null,
    Notifcations:['OFF', 'ON'],
  },
  hass:{},
  hassWS:{},
  Design: {
    theme: 'Main',
    availableThemes: ['Main', 'Unicorn', 'Hacky','BookWorm','BlueOcean','CyperPunk','Darkness'],
  },
  Data: {
    chartData: {},
    userNotes: [],
    PlantDay: {
      breaderHowLong: 0,
      growStart: '',
      flowerSwitch: '',
    },
  },
};

export const GlobalStateProvider = ({ children }) => {
  // Initialisierung des Zustands mit Werten aus dem localStorage, falls vorhanden
  const [state, setState] = useState(() => {
    const storedState = localStorage.getItem('globalOGBState');
    return storedState ? JSON.parse(storedState) : initialState;
  });
  const [accessToken,setAccessToken] = useState(null)
  // Effekt zum Speichern des Zustands im localStorage bei Änderungen
  
  const setHASSAccessToken = (token) => {
    setAccessToken(token)
    setDeep("Conf.haToken",token)
  }

  useEffect(() => {
    if (import.meta.env.PROD) {
      const hass = document.querySelector('home-assistant')?.hass;
      const accessToken = hass.auth.data.access_token
      if (accessToken) {
        setHASSAccessToken(accessToken)
      }
    }else{
      const devToken = localStorage.getItem('haDevToken')
      setHASSAccessToken(devToken)
    }

  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('globalOGBState', JSON.stringify(state));
    localStorage.setItem('globalState', JSON.stringify(state));
  }, [state]);

  const updateState = (path, value) => {
    setState((prevState) => {
      const newState = { ...prevState };
      const keys = path.split('.');
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const getDeep = (path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], state);
  };

  const setDeep = (path, value) => {
    setState((prevState) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const deepClone = JSON.parse(JSON.stringify(prevState));
      const nested = keys.reduce((acc, key) => acc[key], deepClone);
      nested[lastKey] = value;
      return deepClone;
    });
  };

  const getHASS = () => {
        if (import.meta.env.PROD) {
            hass = document.querySelector('home-assistant')?.hass;
            return hass
        }else{
            console.error("NO HASS Object in Dev-Mode")
            return {NOHASS:"NOTHING"}
        }

    }

  return (
    <GlobalStateContext.Provider
      value={{
        state,
        updateState,
        getDeep,
        setDeep,
        getHASS,
        accessToken,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
