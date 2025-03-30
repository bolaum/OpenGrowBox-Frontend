import React, { useState, useEffect } from 'react';

import SetupPage from '../Pages/SetupPage';
import { useGlobalState } from '../Components/Context/GlobalContext';
import { useNavigate} from 'react-router-dom';


const Interface = () => {
  const {getDeep,setDeep } = useGlobalState()
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  // Token aus localStorage holen, wenn die App startet
  
  const handleFirstSetup = ( ) => {
    const accessToken = localStorage.getItem('haToken')
    if(accessToken){
      setToken(accessToken)
      setDeep('Conf.haToken', accessToken);
      localStorage.setItem('haToken',accessToken)

      // ADD FUNCTION TO STORE TOKEN ON BACKED
      // TO NO RE ADD TOKEN FOR ANY DEVICE

    }else{
      setToken(null)
    }  
  }

  useEffect(() => {
    const accessToken = getDeep('Conf.haToken')
    handleFirstSetup(accessToken)
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
