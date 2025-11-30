import styled from 'styled-components';

export const GlobalStyles = styled.div`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
`;

export const ConselhoPortalContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

export const BackButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

export const Title = styled.div`
  text-align: center;
  flex: 1;

  h1 {
    color: #2d3748;
    font-size: 28px;
    margin-bottom: 5px;
  }

  p {
    color: #718096;
    font-size: 14px;
  }
`;

export const LoadingMessage = styled.div`
  color: #667eea;
  font-weight: 600;
  margin-top: 10px;
  font-size: 14px;
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 10px;
`;

export const ExportBtn = styled.button`
  background: ${props => props.disabled ? '#ccc' : 'linear-gradient(135deg, #48bb78, #38a169)'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 15px rgba(72, 187, 120, 0.4)'};
  }
`;

export const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  label {
    font-weight: 600;
    color: #2d3748;
    font-size: 14px;
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #2d3748;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

export const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

export const MetricTitle = styled.h3`
  color: #718096;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MetricValue = styled.div`
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const MetricTrend = styled.div`
  color: ${props => 
    props.trend === 'up' ? '#48bb78' : 
    props.trend === 'down' ? '#e53e3e' : 
    '#718096'};
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const MetricDetail = styled.div`
  color: #a0aec0;
  font-size: 12px;
`;

export const OcupacaoStatus = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
  background: ${props => 
    props.status === 'critico' ? '#fed7d7' : 
    props.status === 'alerta' ? '#feebc8' : 
    props.status === 'estavel' ? '#c6f6d5' : 
    '#e2e8f0'};
  color: ${props => 
    props.status === 'critico' ? '#c53030' : 
    props.status === 'alerta' ? '#d69e2e' : 
    props.status === 'estavel' ? '#276749' : 
    '#4a5568'};
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

export const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

export const ChartTitle = styled.h3`
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
`;

export const ChartLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #667eea;
  font-weight: 600;
`;

export const ChartPlaceholder = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  color: #718096;
  font-size: 14px;
  text-align: center;
`;

export const ChartData = styled.div`
  margin-top: 15px;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
`;

export const ChartDataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12px;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const ChartDataColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color || '#667eea'};
`;

export const TableSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

export const TableTitle = styled.h3`
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
`;

export const TableLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #667eea;
  font-weight: 600;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  th {
    background: #f7fafc;
    color: #2d3748;
    font-weight: 600;
    padding: 15px;
    text-align: left;
    font-size: 14px;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
    font-size: 14px;
  }

  tr:hover {
    background: #f7fafc;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => 
    props.status === 'critico' ? '#fed7d7' : 
    props.status === 'alerta' ? '#feebc8' : 
    props.status === 'normal' ? '#c6f6d5' : 
    '#e2e8f0'};
  color: ${props => 
    props.status === 'critico' ? '#c53030' : 
    props.status === 'alerta' ? '#d69e2e' : 
    props.status === 'normal' ? '#276749' : 
    '#4a5568'};
`;

export const UTIBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: #fed7d7;
  color: #c53030;
  margin-left: 8px;
`;

export const OcupacaoPercentual = styled.span`
  color: ${props => 
    props.percentual >= 90 ? '#c53030' : 
    props.percentual >= 80 ? '#d69e2e' : 
    props.percentual >= 60 ? '#276749' : 
    '#4a5568'};
  font-weight: 600;
`;

export const TableTrend = styled.span`
  color: ${props => 
    props.trend === 'up' ? '#48bb78' : 
    props.trend === 'down' ? '#e53e3e' : 
    '#718096'};
  font-weight: 600;
`;

export const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;