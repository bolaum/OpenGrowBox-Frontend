import React, { useState, useEffect } from 'react';

import SetupPage from '../Pages/SetupPage';
import { useGlobalState } from '../Components/Context/GlobalContext';
import { useNavigate} from 'react-router-dom';


const Interface = () => {
  const {setDeep,getHASS,getDeep} = useGlobalState()
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  // Token aus localStorage holen, wenn die App startet
  

  
  const handleProdView = () => {
    const hass = getHASS()
    const accessToken = hass.auth.data.access_token

    if(accessToken){
      setToken(accessToken)
    }else{
      setToken(null)
    }    
  }

  const handleDevSetup = ( ) => {
    const devToken = localStorage.getItem('haDevToken')
    if(devToken){
      setToken(devToken)
    }else{
      setToken(null)
    }  
  }




  useEffect(() => {
    const accessToken = getDeep('Conf.haToken')
    const devToken = localStorage.getItem('haDevToken')


    if (import.meta.env.PROD) {
      handleProdView(accessToken)
    } else {
      handleDevSetup(devToken)
    }
   
  }, []);

  return (
    <div>
      {token ? (
        <div>
        {navigate("/home")}
        
        </div>
      ) : (
        <SetupPage/>
      )}
    </div>
  );
};

export default Interface;
