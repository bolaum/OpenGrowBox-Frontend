import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactECharts from 'echarts-for-react';
import { useGlobalState } from '../Context/GlobalContext';
import { FaLeaf } from 'react-icons/fa';

const SensorChart = ({ 
  sensorId, minThreshold = 0, maxThreshold = 2000, title = 'Sensor Trends (24h)', unit = '', 
  isLive = false, selectedView, startDate, endDate, targetValues = null
}) => {
  const {state} = useGlobalState();
  const srvAddr = state?.Conf?.hassServer
  const accessToken = state?.Conf?.haToken

  const [chartOptions, setChartOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [selectedView, setSelectedView] = useState(() => localStorage.getItem('selectedView') || DEFAULT_VIEW);
  // const { startDate, endDate } = useViewDates(selectedView, isLive);

  const chartOptionsRef = useRef(null);

  useEffect(() => {
    chartOptionsRef.current = chartOptions;
  }, [chartOptions]);
  
  // Speichere den ausgewählten View im localStorage.
  useEffect(() => {
    localStorage.setItem('selectedView', selectedView);
  }, [selectedView]);

  // Hole die historischen Daten.
  useEffect(() => {
    const abortController = new AbortController();
    let isCurrent = true;

    const fetchHistoryData = async () => {
      // Nur laden anzeigen, wenn nicht im Live-Modus mit bereits geladenen Daten.
      if (!isLive || !chartOptionsRef.current || !startDate || !endDate) {
        setLoading(true);
      }

      if (!startDate || !endDate) {
        return;
      }

      setError(null);
      try {
        const url = `${srvAddr}/api/history/period/${encodeURIComponent(startDate)}?filter_entity_id=${sensorId}&end_time=${encodeURIComponent(endDate)}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        
        const data = await response.json();
        const sensorData = data?.[0] || [];
        const xData = sensorData.map(item => new Date(item.last_changed).toISOString());
        const yData = sensorData.map(item => parseFloat(item.state));

        if (!isCurrent) {
          return;
        }

        setChartOptions({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(20, 20, 40, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            textStyle: { 
              color: '#fff',
              fontSize: 12
            },
            axisPointer: { 
              type: 'cross',
              crossStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              }
            },
            formatter: params => {
              const point = params[0];
              const time = new Date(point.axisValue).toLocaleString('de-DE', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              });
              return `
                <div style="color:white; font-size: 12px;">
                  <strong>${time}</strong><br/>
                  <span style="color: #4FC3F7;">● ${point.seriesName}: ${point.data}${unit}</span>
                </div>
              `;
            }
          },
          grid: { 
            left: '8%', 
            right: '5%', 
            bottom: '15%', 
            top: '15%',
            containLabel: true,
            backgroundColor: 'transparent'
          },
          xAxis: {
            type: 'category',
            data: xData,
            boundaryGap: false,
            axisLine: { 
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10,
              margin: 15,
              formatter: value => {
                const date = new Date(value);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.05)',
                type: 'dashed'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: { 
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: { 
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.05)',
                type: 'dashed'
              } 
            },
            axisLabel: { 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            }
          },
          series: [{
            name: title.replace(' (24h)', ''),
            data: yData,
            type: 'line',
            smooth: true,
            smoothMonotone: 'x',
            lineStyle: {
              width: 3,
              color: '#4FC3F7',
              shadowColor: 'rgba(79, 195, 247, 0.3)',
              shadowBlur: 8,
              shadowOffsetY: 2
            },
            symbol: 'none',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(79, 195, 247, 0.4)'
                }, {
                  offset: 0.5,
                  color: 'rgba(79, 195, 247, 0.2)'
                }, {
                  offset: 1,
                  color: 'rgba(79, 195, 247, 0.05)'
                }]
              }
            },
            emphasis: {
              focus: 'series',
              lineStyle: {
                width: 4
              }
            },
            markLine: targetValues !== null
              ? {
                  silent: true,
                  symbol: 'none',
                  data: [
                    targetValues.optimal ? {
                      yAxis: targetValues.optimal,
                      lineStyle: {
                        color: 'rgba(255, 82, 82, 0.55)',
                        width: 2,
                        type: 'solid'
                      },
                      label: {
                        show: false,
                        position: 'insideMiddleTop',
                        formatter: () => `${targetValues.optimal}${unit}`,
                        color: 'rgba(255, 255, 255, 0.85)',
                        backgroundColor: 'rgba(255, 82, 82, 0.35)',
                        padding: [4, 6],
                        borderRadius: 4
                      }
                    } : undefined,                    
                  ].filter(v => !!v)
                }
              : undefined
          }]
        });
      } catch (err) {
        if (!isCurrent || err?.name === 'AbortError') {
          return;
        }
        setError('Failed to load data.');
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchHistoryData();

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [
    startDate, endDate, isLive, sensorId, srvAddr, accessToken,
    minThreshold, maxThreshold, selectedView, title, unit, targetValues
  ]);

  return (
    <ChartWrapper>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      
      <Chart>
        {loading ? (
          <LoadingWrapper>
            <LoadingText>Loading Data</LoadingText>
            <LoadingIcon />
          </LoadingWrapper>
        ) : chartOptions ? (
          <ReactECharts 
            option={chartOptions} 
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        ) : (
          !loading && <Message>No Data Available</Message>
        )}
      </Chart>
    </ChartWrapper>
  );
};

export default SensorChart;

const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  background: var(--main-bg-card-color);
  border-radius: 16px;
  box-shadow: var(--main-shadow-art);
  width: 100%;
  height: 100%;
  min-height: 15rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(79, 195, 247, 0.02) 0%, 
      rgba(156, 39, 176, 0.02) 50%, 
      rgba(63, 81, 181, 0.02) 100%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    min-height: 22rem;
    padding: 1rem;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const ChartTitle = styled.h3`
  color: var(--main-text-color);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const Chart = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  overflow: hidden;
  
  .echarts-for-react {
    min-height: 15rem;
    border-radius: 12px;
    
    @media (max-width: 768px) {
      min-height: 12rem;
    }
  }
`;

const Message = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin: 2rem 0;
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  40% {
    transform: translateY(-10px) rotate(10deg);
  }
  60% {
    transform: translateY(-5px) rotate(-5deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    color: rgba(79, 195, 247, 0.8);
    filter: drop-shadow(0 0 5px rgba(79, 195, 247, 0.5));
  }
  50% {
    color: rgba(156, 39, 176, 0.8);
    filter: drop-shadow(0 0 8px rgba(156, 39, 176, 0.6));
  }
`;

const LoadingIcon = styled(FaLeaf)`
  animation: ${bounce} 2s infinite, ${glow} 3s infinite;
  margin-left: 0.5rem;
  font-size: 1.5rem;
`;

const LoadingText = styled.span`
  color: var(--main-text-color);
  font-size: 1rem;
  font-weight: 500;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex-direction: row;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
`;