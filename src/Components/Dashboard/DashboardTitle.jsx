import { motion, AnimatePresence, color } from 'framer-motion';
import styled from 'styled-components';
import OGBIcon from '../../misc/OGBIcon'

const DashboardTitle = ({firstText,secondText,thirdText}) => {
  return (
    <TitleContainer>
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {firstText}
      </motion.span>
      


      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {secondText}
      
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ marginLeft: 0.4,marginTop:0.5 }}
      >
        {thirdText}
      </motion.span>

      <AnimatePresence>
        <motion.div
          key="cannabis"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ display: 'inline-block', margin: '0 8px' }}
        >


          <CannabisIcon/>
        </motion.div>
      </AnimatePresence>
      
      <ModBy/>

    </TitleContainer>
  );
};

const CannabisIcon = () => (
  <motion.span

    initial={{ color: "#4CAF50" }}
    animate={{ color: ["#4CAF50", "#FF9800"] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "mirror",
    }}
    style={{ display: 'inline-block' }}
  >
    <OGBIcon style={{ width: '1.2em', height: '1.2em' }} />
  </motion.span>
);

const ModBy = ()  => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{
      duration: 5,
      repeat: Infinity,
      repeatType: "mirror",
    }}
    style={{ 
      display: 'inline-block',
      fontSize: 'small', 
      alignSelf: 'end',
      marginBottom: '5px',
      transform: 'scale(0.8, 1) translate(-27px, 7px)'
    }}
  >
    bolaum mod
  </motion.span>
);

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content:space-around;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width:75%
  span {
    transition: all 0.3s ease;
  }


  &:hover {
    span:first-child {
      color:rgb(23, 219, 32);
      transform: translateY(-2px);
    }
    span:nth-child(3) {
      color:rgb(163, 225, 30);
      transform: translateY(2px);
    }
    span:last-child {
      color:rgb(227, 168, 20);
    }
    svg {
      width: 1.2rem;
      height: 1.2rem;
      transform: scale(1.1) rotate(15deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 1.0rem;
    svg {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
`;

export default DashboardTitle;
