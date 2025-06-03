import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';

import { useGlobalState } from '../Context/GlobalContext';
import { FaCannabis } from 'react-icons/fa';

const LoadingIndicator = () => (
  <LoadingContainer>
    <FaCannabis className="loading-icon" />
    <p>Loading data...</p>
  </LoadingContainer>
);

const HistoryChart = ({ sensorId, onClose, minThreshold = 400, maxThreshold = 1200 }) => {
  
  const getDefaultDate = (offset = 0) => {
    const date = new Date(Date.now() + offset);
    const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };


  const [startDate, setStartDate] = useState(getDefaultDate(-24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(getDefaultDate());
  const [chartOptions, setChartOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const {state} = useGlobalState();
  const srvAddr = state?.Conf?.hassServer
  const token = state?.Conf?.haToken


  const fetchHistoryData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    setError(null);
    setLoading(true);

    const url = `${srvAddr}/api/history/period/${encodeURIComponent(startDate)}?filter_entity_id=${sensorId}&end_time=${encodeURIComponent(endDate)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      const sensorData = data && data.length > 0 ? data[0] : [];

      const xData = sensorData.map(item => item.last_changed);
      const yData = sensorData.map(item => parseFloat(item.state));

      // RGB Farben definieren
      const colorScheme = {
        colorBelowMin: 'rgb(255, 0, 0)',      // Rot (unter Min)
        colorAboveMax: 'rgb(0, 0, 255)',      // Blau (über Max)
        colorWithinRange: '#32CD32',           // Grün (innerhalb Range)
        areaColor: 'rgba(0, 255, 0, 0.1)',     // Heller grüner Bereich
      };

      // Daten mit Farb-Styles formatieren
      const formattedData = yData.map(value => ({
        value,
        itemStyle: {
          color: value < minThreshold ? colorScheme.colorBelowMin : value > maxThreshold ? colorScheme.colorAboveMax : colorScheme.colorWithinRange,
        },
      }));

      setChartOptions({
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: { color: '#333' },
          axisPointer: { type: 'line' },
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xData,
          boundaryGap: false,
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: {
            color: '#666',
            formatter: value => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#eee' } },
        },
        series: [{
          data: formattedData,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: colorScheme.colorWithinRange, // Standardfarbe für die Linie
          },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: (params) => params.data.itemStyle.color, // Dynamische Punktfarbe
          },
          areaStyle: {
            color: colorScheme.areaColor, // Farbverlauf unter der Linie
          },
        }],
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [startDate, endDate]);  // Ensure the dates trigger a re-fetch on change

  return (
    <HistoryContainer>
      <Header>{sensorId}</Header>
      <DateInputs>
        <label>
          Start:
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End:
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </DateInputs>
      {loading && <LoadingIndicator />} 
      {error && <Message $error>{error}</Message>}
      {chartOptions ? <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} /> : !loading && <Message>Please select a time range and fetch data.</Message>}
      <CloseButton onClick={onClose}></CloseButton>
    </HistoryContainer>
  );
};

export default HistoryChart;


const HistoryContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--main-bg-color);
`;

const Header = styled.div`
  font-size:1.5rem;
  font-weight:800;
  padding:1rem;
  text-align: center;
  color: var(--primary-accent);
      @media (max-width: 768px) {
        font-size:0.7rem;
        transition: color 0.3s ease;
    }

`;

const DateInputs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

    @media (max-width: 768px) {
        justify-content:center;
        align-items:center;
        flex-direction:column;
        transition: color 0.3s ease;
    }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 2rem;
  cursor: pointer;
`;

const Message = styled.p`
  text-align: center;
  color: ${props => (props.$error ? 'red' : '#333')};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4caf50;
  .loading-icon {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
