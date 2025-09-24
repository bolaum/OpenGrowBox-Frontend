import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import BottomBar from '../Navigation/BottomBar'
import { usePremium } from '../Context/OGBPremiumContext'
import { useMemo, useState, useEffect } from 'react'
import { FaCannabis } from 'react-icons/fa'

const StrainDB = () => {
  const { isPremium, session, subscription, loading: contextLoading } = usePremium()
  const [currentProgress, setCurrentProgress] = useState(85)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [dots, setDots] = useState('')

  const funnyMessages = useMemo(() => [
    "🌿 Sorry, but this strain database is too dank for your current plan! 🌿",
    "🚫 You need to be at least this premium to ride this feature! 🌱",
    "🔒 These strains are locked in the top shelf vault – upgrade to unlock! 🔒",
    "💚 Don't be basic – go premium and explore every strain! 💚",
    "🌿 Your plan is a seedling, but this feature is for full bloomers! 🌿"
  ], [])

  const wipMessages = useMemo(() => [
    "🧬 Analyzing strain genetics",
    "🌱 Growing the database",
    "🔬 Testing THC/CBD calculations",
    "📊 Building strain charts",
    "🎨 Polishing the interface",
    "🔍 Adding search filters",
    "⚡ Optimizing performance",
    "🌿 Curating strain profiles"
  ], [])

  const features = useMemo(() => [
    { name: "Strain Search Engine", status: "completed", icon: "🔍" },
    { name: "Strain Comparison Tool", status: "completed", icon: "⚖️" },

    { name: "Personal Strain Journal", status: "testing", icon: "📝" },
    { name: "Recommendation Engine", status: "finalizing", icon: "🎯" }
  ], [])

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const newProgress = prev + Math.random() * 2
        return newProgress >= 95 ? 85 + Math.random() * 10 : newProgress
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % wipMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [wipMessages.length])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const getRandomFunnyMessage = () =>
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)]

  if (!contextLoading && !isPremium) {
    return (
      <>
        <BottomBar />
        <DenyWrapper>
          <h2>🚫 Access Denied</h2>
          <p>{getRandomFunnyMessage()}</p>
          <UpgradeButton onClick={() => window.location.href = 'https://opengrowbox.net'}>
            🚀 Upgrade Now
          </UpgradeButton>
        </DenyWrapper>
      </>
    )
  }

  return (
    <>
      <BottomBar />
      <MotionContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WipCard>
          <CardHeader>
            <PlantIcon>  <AnimatedPlantIcon /> </PlantIcon>
            <Title>Strain Database</Title>
            <StatusBadge>Almost Ready!</StatusBadge>
          </CardHeader>
          
          <ProgressSection>
            <ProgressText>Development Progress</ProgressText>
            <ProgressBarContainer>
              <ProgressBar width={currentProgress} />
              <ProgressPercentage>{Math.round(currentProgress)}%</ProgressPercentage>
            </ProgressBarContainer>
          </ProgressSection>

          <CurrentWork>
            <WorkIcon>⚙️</WorkIcon>
            <WorkText>{wipMessages[currentMessage]}{dots}</WorkText>
          </CurrentWork>

          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureItem key={index} status={feature.status}>
                <span>{feature.icon}</span>
                <span>{feature.name}</span>
                <StatusDot status={feature.status} />
              </FeatureItem>
            ))}
          </FeaturesGrid>

          <EtaSection>
            <EtaIcon>🚀</EtaIcon>
            <EtaText>Expected Launch: Very Soon™</EtaText>
          </EtaSection>

          <ComingSoonNote>
            This feature is in final development phase. 
            Get ready to explore an extensive database of cannabis strains 
            with detailed information, effects, personalized recommendations, and many More!
          </ComingSoonNote>
        </WipCard>
      </MotionContainer>
    </>
  )
}

export default StrainDB

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`

// Styled Components
const MotionContainer = motion(styled.div`
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
`)

const WipCard = styled.div`
  background: var(--main-bg-card-color);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--main-shadow-art);
  color: var(--main-text-color);
  font-family: 'Arial', sans-serif;
  border: 2px solid var(--primary-accent);
`

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--primary-accent);
  padding-bottom: 1rem;
`

const PlantIcon = styled.div`
  font-size: 3rem;
  animation: ${bounce} 2s infinite;
  margin-bottom: 0.5rem;
`

const Title = styled.h1`
  margin: 0.5rem 0;
  font-size: 2rem;
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const StatusBadge = styled.span`
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  animation: ${pulse} 2s infinite;
`

const ProgressSection = styled.div`
  margin-bottom: 2rem;
`

const ProgressText = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
  color: var(--primary-accent);
`

const ProgressBarContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
`

const ProgressBar = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50);
  background-size: 200px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
`

const ProgressPercentage = styled.div`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
`

const CurrentWork = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 10px;
  border-left: 4px solid var(--primary-accent);
`

const WorkIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
  animation: ${pulse} 1.5s infinite;
`

const WorkText = styled.span`
  font-style: italic;
  color: var(--primary-accent);
`

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 2rem;
`

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  opacity: ${props => props.status === 'completed' ? 1 : 0.7};
  
  span:first-child {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
  
  span:nth-child(2) {
    flex: 1;
    font-size: 0.9rem;
  }
`

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch(props.status) {
      case 'completed': return '#4CAF50'
      case 'in-progress': return '#FF9800'
      case 'testing': return '#2196F3'
      case 'finalizing': return '#9C27B0'
      default: return '#757575'
    }
  }};
  animation: ${props => props.status !== 'completed' ? pulse : 'none'} 1s infinite;
`

const EtaSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1));
  border-radius: 10px;
`

const EtaIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
  animation: ${bounce} 2s infinite;
`

const EtaText = styled.span`
  font-weight: bold;
  color: var(--primary-accent);
`

const ComingSoonNote = styled.p`
  text-align: center;
  font-style: italic;
  opacity: 0.8;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
`

// Keep original styled components for the access denied section
const DenyWrapper = styled.div`
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  border-radius: 10px;
  color: white;
  margin: 2rem;
`

const UpgradeButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;

  &:hover {
    background: #27ae60;
  }
`

const AnimatedPlantIcon = styled(FaCannabis)`
  animation: colorChange 4s infinite alternate;

  font-size:3rem

  @keyframes colorChange {
    0%   { color: lightgreen; }
    50% { color: green; }
    100% { color: magenta; }
  }
`