import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useGlobalState } from '../Context/GlobalContext';
import { FaLeaf } from 'react-icons/fa';
import { useHomeAssistant } from '../Context/HomeAssistantContext';

const LoadingIndicator = () => (
  <LoadingContainer>
    <div className="loading-spinner">
      <FaLeaf className="loading-icon" />
    </div>
    <LoadingText>Grow Data is Loading...</LoadingText>
  </LoadingContainer>
);

const GrowMetrics = ({ room = 'default', timeRange, startDate, endDate, isLive = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('all');
  // const [timeRange, setTimeRange] = useState(() => localStorage.getItem('growMetricsTimeRange') || '8h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [targetValues, setTargetValues] = useState({});

  const abortControllerRef = useRef(null);
  const activeRequestRef = useRef(null);

  const { entities, currentRoom } = useHomeAssistant();

  const { state } = useGlobalState();
  const srvAddr = state?.Conf?.hassServer;
  const token = state?.Conf?.haToken;

  // Default Werte als Fallback
  const defaultTargetValues = useMemo(() => ({
    vpd: { min: 1.1, max: 1.35, optimal: 1.2 },
    temperature: { min: 22, max: 28, optimal: (22 + 28) / 2 },
    humidity: { min: 50, max: 60, optimal: (50 + 60) / 2 },
    co2: { min: 600, max: 1000, optimal: 800 },
    pH: { min: 5.8, max: 6.2, optimal: 6.0 },
    EC: { min: 400.0, max: 5000, optimal: 2500 },
  }), []);

  // Sensor Entity IDs - dynamisch aus verfügbaren Entities ermitteln
  const sensorEntities = useMemo(() => {
    const room = currentRoom?.toLowerCase() || 'default';

    // Definierte Sensor-Patterns für verschiedene Metriken
    const patterns = {
      vpd: [
        `sensor.ogb_currentvpd_${room}`,
      ],
      temperature: [
        `sensor.ogb_avgtemperature_${room}`,
      ],
      humidity: [
        `sensor.ogb_avghumidity_${room}`,
      ],
      // Für pH, EC, CO₂ jetzt Regex
      pH: /sensor\..*_ph$/,
      EC: /sensor\..*_ec$/,
      co2: /sensor\..*(_co2|_carbondioxide)$/,
    };

    const foundEntities = {};

    Object.entries(patterns).forEach(([metric, pattern]) => {
      if (Array.isArray(pattern)) {
        // alte Logik: Liste von fixen Namen
        for (const candidate of pattern) {
          if (entities && entities[candidate]) {
            foundEntities[metric] = candidate;
            break;
          }
        }
      } else if (pattern instanceof RegExp) {
        // neue Logik: Regex-Suche
        const match = Object.keys(entities || {}).find(eid => pattern.test(eid));
        if (match) {
          foundEntities[metric] = match;
        }
      }
    });


    return foundEntities;
  }, [entities, currentRoom]);


  const controlEntities = useMemo(() => {
    const room = currentRoom?.toLowerCase() || 'default';

    const patterns = {
      temperature: {
        min: [`number.ogb_mintemp_${room}`],
        max: [`number.ogb_maxtemp_${room}`],
        optimal: [`number.ogb_opttemp_${room}`],
      },
      humidity: {
        min: [`number.ogb_minhum_${room}`],
        max: [`number.ogb_maxhum_${room}`],
        optimal: [`number.ogb_opthum_${room}`],
      },
      vpd: {
        min: [`sensor.ogb_current_vpd_target_min_${room}`],
        max: [`sensor.ogb_current_vpd_target_max_${room}`],
        optimal: [`sensor.ogb_current_vpd_target_${room}`],
      },
      co2: {
        min: [`number.ogb_co2minvalue_${room}`],
        max: [`number.ogb_co2maxvalue_${room}`],
        optimal: [`number.ogb_co2targetvalue_${room}`],
      },
      pH: {
        min: [`number.ogb_minph_${room}`, `number.${room}_ph_min`],
        max: [`number.ogb_maxph_${room}`, `number.${room}_ph_max`],
        optimal: [`number.ogb_feed_ph_target_${room}`],
      },
      EC: {
        min: [`number.ogb_minec_${room}`, `number.${room}_ec_min`],
        max: [`number.ogb_maxec_${room}`, `number.${room}_ec_max`],
        optimal: [`number.ogb_feed_ec_target_${room}`],
      },
    };

    const found = {};
    Object.entries(patterns).forEach(([metric, limits]) => {
      found[metric] = {};
      Object.entries(limits).forEach(([bound, entityPatterns]) => {
        for (const pattern of entityPatterns) {
          if (entities && entities[pattern]) {
            found[metric][bound] = pattern;
            break;
          }
        }
      });
    });

    return found;
  }, [entities, currentRoom]);

  // Kombiniere Control Entities Werte mit Default Werten als Fallback
  const loadedTargetValues = useMemo(() => {
    const result = {};
    
    Object.keys(defaultTargetValues).forEach(metric => {
      const controlEntity = controlEntities[metric];
      const defaultValues = defaultTargetValues[metric];
      
      result[metric] = {
        min: defaultValues.min,
        max: defaultValues.max,
        optimal: defaultValues.optimal
      };

      // Wenn Control Entities verfügbar sind, deren Werte verwenden
      if (controlEntity) {
        if (controlEntity.min && entities[controlEntity.min]) {
          const minValue = parseFloat(entities[controlEntity.min].state);
          if (!isNaN(minValue)) {
            result[metric].min = minValue;
          }
        }

        if (controlEntity.max && entities[controlEntity.max]) {
          const maxValue = parseFloat(entities[controlEntity.max].state);
          if (!isNaN(maxValue)) {
            result[metric].max = maxValue;
          }
        }

        if (controlEntity.optimal && entities[controlEntity.optimal]) {
          const optimalValue = parseFloat(entities[controlEntity.optimal].state);
          if (!isNaN(optimalValue)) {
            result[metric].optimal = optimalValue;
          }
        }
      }
    });

    return result;
  }, [controlEntities, defaultTargetValues, entities]);

  const fetchSensorData = useCallback(async (entityId, startTime, endTime, signal) => {
    const url = `${srvAddr}/api/history/period/${encodeURIComponent(startTime)}?filter_entity_id=${entityId}&end_time=${encodeURIComponent(endTime)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Error fetching ${entityId}: ${response.statusText}`);
      }

      const data = await response.json();
      return data && data.length > 0 ? data[0] : [];
    } catch (err) {
      if (err?.name === 'AbortError') {
        return [];
      }
      console.warn(`Failed to fetch data for ${entityId}:`, err);
      return [];
    }
  }, [srvAddr, token]);

  const fetchAllGrowData = useCallback(async () => {
    if (!srvAddr || !token) {
      setError('Home Assistant Server oder Token nicht konfiguriert');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = Symbol('growData');
    activeRequestRef.current = requestId;

    if (!startDate || !endDate) {
      controller.abort();
      abortControllerRef.current = null;
      activeRequestRef.current = null;
      setLoading(false);
      return;
    }

    if (!isLive) {
      setLoading(true);
    }

    setError(null);

    try {
      // const { start, end } = getTimeRangeDate();
      const start = startDate;
      const end = endDate;
      // Alle Sensor-Daten parallel laden
      const sensorPromises = Object.entries(sensorEntities).map(async ([metric, entityId]) => {
        const data = await fetchSensorData(entityId, start, end, controller.signal);
        return { metric, data };
      });

      const sensorResults = await Promise.all(sensorPromises);

      // Daten zu einem Timeline-Format kombinieren
      const timelineData = {};
      
      sensorResults.forEach(({ metric, data }) => {
        data.forEach(reading => {
          const timestamp = reading.last_changed;
          const value = parseFloat(reading.state);
          
          if (!isNaN(value) && timestamp) {
            // VPD DataCleaner → 0.0 ignorieren
            if (metric === "vpd" && value === 0.0) {
              return;
            }

            if (!timelineData[timestamp]) {
              timelineData[timestamp] = { timestamp };
            }
            timelineData[timestamp][metric] = value;
          }
        });
      });

      // Sortiere nach Timestamp und konvertiere zu Array
      const sortedData = Object.values(timelineData)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(reading => ({
          ...reading,
          timestamp: new Date(reading.timestamp).toISOString()
        }));

      if (activeRequestRef.current !== requestId || controller.signal.aborted) {
        return;
      }

      setHistoricalData(sortedData);

      // Target Values setzen
      setTargetValues(loadedTargetValues);

    } catch (err) {
      console.error('Error fetching grow data:', err);
      if (activeRequestRef.current !== requestId || err?.name === 'AbortError') {
        return;
      }
      setError('Fehler beim Laden der Grow-Daten');
    } finally {
      if (activeRequestRef.current === requestId) {
        setLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, [srvAddr, token, startDate, endDate, sensorEntities, loadedTargetValues, fetchSensorData]);


  useEffect(() => {
    fetchAllGrowData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      activeRequestRef.current = null;
    };
  }, [fetchAllGrowData, timeRange, room, srvAddr, token, loadedTargetValues, startDate, endDate, isLive]);

  // Analyse der Daten (gleiche Logik wie vorher)
  const analysis = useMemo(() => {
    if (!historicalData.length || !Object.keys(targetValues).length) {
      return {};
    }

    const results = {};
    
    Object.keys(targetValues).forEach(metric => {
      const values = historicalData
        .map(d => d[metric])
        .filter(v => v !== undefined && !isNaN(v));
      
      if (values.length === 0) {
        results[metric] = {
          total: 0,
          optimal: 0,
          inRange: 0,
          nearRange: 0,
          outOfRange: 0,
          optimalPercent: '0.0',
          inRangePercent: '0.0',
          nearRangePercent: '0.0',
          outOfRangePercent: '0.0',
          average: '0.00',
          min: '0.00',
          max: '0.00',
          currentValue: '0.00',
          isAvailable: false
        };
        return;
      }

      const target = targetValues[metric];
      let inRange = 0;
      let nearRange = 0;
      let outOfRange = 0;
      
      const tolerance = (target.max - target.min) * 0.05; // 5% Toleranz
      const optimalTolerance = (target.max - target.min) * 0.1; // 10% um Optimal-Wert
      
      let optimal = 0;
      
      values.forEach(value => {
        // Prüfe zuerst optimal (engster Bereich um optimal value)
        if (value >= (target.optimal - optimalTolerance) && value <= (target.optimal + optimalTolerance)) {
          optimal++;
        }
        
        // Dann normale Bereichsprüfung
        if (value >= target.min && value <= target.max) {
          inRange++;
        } else if (value >= (target.min - tolerance) && value <= (target.max + tolerance)) {
          nearRange++;
        } else {
          outOfRange++;
        }
      });
      
      const total = values.length;
      results[metric] = {
        total,
        optimal,
        inRange,
        nearRange,
        outOfRange,
        optimalPercent: ((optimal / total) * 100).toFixed(1),
        inRangePercent: ((inRange / total) * 100).toFixed(1),
        nearRangePercent: ((nearRange / total) * 100).toFixed(1),
        outOfRangePercent: ((outOfRange / total) * 100).toFixed(1),
        average: (values.reduce((a, b) => a + b, 0) / total).toFixed(2),
        min: Math.min(...values).toFixed(2),
        max: Math.max(...values).toFixed(2),
        currentValue: values[values.length - 1]?.toFixed(2) || '0.00',
        isAvailable: values[values.length - 1] ? true : false
      };
    });
    
    return results;
  }, [historicalData, targetValues]);

  const overallScore = useMemo(() => {
      // Filtere nur Werte > 0 (existierende Sensoren mit Daten)
      const optimalScores = Object.values(analysis)
          .map(a => parseFloat(a.optimalPercent))
          .filter(score => score > 0);
          
      const inRangeScores = Object.values(analysis)
          .map(a => parseFloat(a.inRangePercent))
          .filter(score => score > 0);
      
     
      if (optimalScores.length === 0) return { avgRange: '0.0', avgOptimal: '0.0' };
      
      const avgOptimal = optimalScores.reduce((a, b) => a + b, 0) / optimalScores.length;
      const avgInRange = inRangeScores.reduce((a, b) => a + b, 0) / inRangeScores.length;
      

      
      return { avgRange: avgInRange.toFixed(2), avgOptimal: avgOptimal.toFixed(2) };
  }, [analysis]);

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  const getMetricUnit = (metric) => {
    const units = {
      pH: '',
      EC: 'mS/cm',
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      vpd: 'kPa',
      lightIntensity: '%'
    };
    return units[metric] || '';
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          ⚠️ {error}
          <RetryButton onClick={fetchAllGrowData}>
            Retry Again
          </RetryButton>
        </ErrorMessage>
      </Container>
    );
  }

  if (!historicalData.length) {
    return (
      <Container>
        <NoDataMessage>
          📊 No data Found for that Time you provided
          <DataInfo>
            Check your Sensor Entiy_id and the Time Period 
          </DataInfo>
        </NoDataMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Grow Metrics Analytics - {room}</Title>
        <OverallScore score={overallScore.avgRange}>
          Overall Range: {overallScore.avgRange}%
        </OverallScore>
        <OverallScore score={overallScore.avgOptimal}>
          Overall Optimal: {overallScore.avgOptimal}%
        </OverallScore>


      </Header>

      <Controls>
        <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
          <option value="all">All Metrics</option>
          {analysis.pH?.isAvailable && <option value="pH">pH</option>}
          {analysis.EC?.isAvailable && <option value="EC">EC</option>}
          {analysis.temperature?.isAvailable && <option value="temperature">Temperature</option>}
          {analysis.humidity?.isAvailable && <option value="humidity">Humidity</option>}
          {analysis.co2?.isAvailable && <option value="co2">CO2</option>}
          {analysis.vpd?.isAvailable && <option value="vpd">VPD</option>}
          {analysis.lightIntensity?.isAvailable && <option value="lightIntensity">Light Intensity</option>}
        </Select>
      </Controls>

      <DataStats>
        <StatItem>
          <StatLabel>Total Readings</StatLabel>
          <StatValue>{historicalData.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Time Range</StatLabel>
          <StatValue>{timeRange}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Active Sensors</StatLabel>
          <StatValue>{Object.keys(sensorEntities).length}/{Object.keys(controlEntities).length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Room</StatLabel>
          <StatValue>{currentRoom || 'Unknown'}</StatValue>
        </StatItem>
      </DataStats>

      {Object.keys(sensorEntities).length === 0 && (
        <WarningMessage>
          ⚠️ Keine passenden Sensoren gefunden für Room: {currentRoom}
          <SensorList>
            Searched Sensors:
            <ul>
              <li>sensor.ogb_avgtemp_{currentRoom?.toLowerCase()}</li>
              <li>sensor.ogb_avghum_{currentRoom?.toLowerCase()}</li>
              <li>sensor.ogb_currentvpd_{currentRoom?.toLowerCase()}</li>
              <li>sensor.{currentRoom}_ph</li>
              <li>sensor.{currentRoom}_ec</li>
              <li>sensor.{currentRoom}_co2</li>
              <li>sensor.{currentRoom}_light_intensity</li>
            </ul>
          </SensorList>
        </WarningMessage>
      )}

      {/* Target Values Status Anzeige */}
      <Summary>
        <SummaryTitle>Performance Summary</SummaryTitle>
        <SummaryGrid>
          {Object.entries(analysis).filter(([, { isAvailable }]) => isAvailable).map(([metric, data]) => (
            <SummaryItem key={metric}>
              <SummaryMetric>{metric}</SummaryMetric>
              <OptimalIndicator>
                <SummaryPercentage color="#4CAF50">
                  {data.optimalPercent}%
                </SummaryPercentage>
                <OptimalLabel>Optimal</OptimalLabel>
              </OptimalIndicator>
              <InRangeIndicator>
                <SummaryPercentage color={getStatusColor(data.inRangePercent)} style={{fontSize: '1.2rem'}}>
                  {data.inRangePercent}%
                </SummaryPercentage>
                <OptimalLabel>In Range</OptimalLabel>
              </InRangeIndicator>
            </SummaryItem>
          ))}
        </SummaryGrid>
      </Summary>

      <MetricsGrid>
        {Object.entries(analysis)
          .filter(([metric, { isAvailable }]) => (selectedMetric === 'all' || selectedMetric === metric) && isAvailable)
          .map(([metric, data]) => (
            <MetricCard key={metric}>
              <MetricHeader>
                <MetricName>{metric.toUpperCase()}</MetricName>
                <CurrentValue>
                  {data.currentValue} {getMetricUnit(metric)}
                </CurrentValue>
              </MetricHeader>

              <TargetRange>
                Target: {targetValues[metric]?.min} - {targetValues[metric]?.max} {getMetricUnit(metric)}
                <OptimalValue>Optimal: {targetValues[metric]?.optimal}</OptimalValue>
              </TargetRange>

              <StatsGrid>
                <StatItem>
                  <StatLabel>🎯 Optimal</StatLabel>
                  <StatValue color={getStatusColor(data.optimalPercent)}>
                    {data.optimalPercent}%
                  </StatValue>
                  <StatCount>({data.optimal}/{data.total})</StatCount>
                </StatItem>

                <StatItem>
                  <StatLabel>✅ In Range</StatLabel>
                  <StatValue color={getStatusColor(data.inRangePercent)}>
                    {data.inRangePercent}%
                  </StatValue>
                  <StatCount>({data.inRange}/{data.total})</StatCount>
                </StatItem>

                <StatItem>
                  <StatLabel>⚠️ Near Range</StatLabel>
                  <StatValue color={getStatusColor(60)}>
                    {data.nearRangePercent}%
                  </StatValue>
                  <StatCount>({data.nearRange}/{data.total})</StatCount>
                </StatItem>

                <StatItem>
                  <StatLabel>❌ Out of Range</StatLabel>
                  <StatValue color={getStatusColor(0)}>
                    {data.outOfRangePercent}%
                  </StatValue>
                  <StatCount>({data.outOfRange}/{data.total})</StatCount>
                </StatItem>
              </StatsGrid>

              <ProgressBar>
                <ProgressSegment 
                  width={data.optimalPercent} 
                  color="#4CAF50"
                  title={`Optimal: ${data.optimalPercent}%`}
                />
                <ProgressSegment 
                  width={data.inRangePercent} 
                  color={getStatusColor(data.inRangePercent)}
                  title={`In Range: ${data.inRangePercent}%`}
                />
                <ProgressSegment 
                  width={data.nearRangePercent} 
                  color={getStatusColor(60)}
                  title={`Near Range: ${data.nearRangePercent}%`}
                />
                <ProgressSegment 
                  width={data.outOfRangePercent} 
                  color={getStatusColor(0)}
                  title={`Out of Range: ${data.outOfRangePercent}%`}
                />
              </ProgressBar>

              <DetailStats>
                <DetailStat>
                  <span>Average:</span>
                  <span>{data.average} {getMetricUnit(metric)}</span>
                </DetailStat>
                <DetailStat>
                  <span>Min/Max:</span>
                  <span>{data.min} / {data.max} {getMetricUnit(metric)}</span>
                </DetailStat>
              </DetailStats>
            </MetricCard>
          ))}
      </MetricsGrid>
    </Container>
  );
};




// Styled Components (gleiche wie vorher, plus neue für Loading/Error)
const Container = styled.div`
  color: var(--main-text-color);
  overflow: hidden;
  font-size: 0.75rem;
  border: 1px solid rgba(125, 125, 125, 0.5);
  border-radius: 20px;
  margin-right: 2rem;
  min-height: 80vh;
  min-width:100%;
  box-shadow: var(--main-shadow-art);
  background: var(--main-bg-card-color);
  padding: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  gap: 1rem;

  .loading-spinner {
    animation: spin 2s linear infinite;
    font-size: 2rem;
    color: #4CAF50;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  font-size: 1rem;
  color: #F44336;
  gap: 1rem;
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #45a049;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  gap: 0.5rem;
`;

const DataInfo = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const DataStats = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 1rem;
`;

// Alle anderen styled components wie in der vorherigen Version...
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const OverallScore = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, 
    ${props => props.score >= 80 ? '#4CAF50' : props.score >= 60 ? '#FFEB3B' : '#F44336'}, 
    ${props => props.score >= 80 ? '#45a049' : props.score >= 60 ? '#FDD835' : '#d32f2f'});

  color: black;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(125, 125, 125, 0.3);
  border-radius: 10px;
  background: var(--main-bg-card-color);
  color: var(--main-text-color);
  font-size: 0.8rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(125, 125, 125, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MetricName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #64B5F6;
`;

const CurrentValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #4CAF50;
`;

const TargetRange = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const OptimalValue = styled.div`
  color: #4CAF50;
  font-weight: 500;
  margin-top: 0.25rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.color};
`;

const StatCount = styled.div`
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 0.25rem;
`;

const ProgressBar = styled.div`
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
`;

const ProgressSegment = styled.div`
  width: ${props => props.width}%;
  background: ${props => props.color};
`;

const DetailStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  opacity: 0.8;
`;

const DetailStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  span:first-child {
    opacity: 0.6;
  }
  
  span:last-child {
    font-weight: 500;
  }
`;

const Summary = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(125, 125, 125, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom:1rem;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SummaryMetric = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const WarningMessage = styled.div`
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #FF9800;
`;

const OptimalIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const InRangeIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SensorList = styled.div`
  margin-top: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.8;

  ul {
    margin: 0.5rem 0;
    padding-left: 1rem;
  }

  li {
    margin: 0.2rem 0;
    font-family: monospace;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
`;

const SummaryPercentage = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.color};
`;

const OptimalLabel = styled.div``


export default GrowMetrics;