import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

export const GlobalStyles = styled.div`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8fafc;
    color: #334155;
    line-height: 1.6;
  }
`;

export const ConselhoPortalContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const BackButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export const Title = styled.div`
  flex: 1;
  text-align: center;

  h1 {
    font-size: 2.25rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

export const LoadingMessage = styled.div`
  color: #3b82f6;
  font-weight: 500;
  margin-top: 0.5rem;
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-self: center;
`;

export const ExportBtn = styled.button`
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  label {
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
  }
`;

export const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const MetricCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e2e8f0;
  position: relative;
`;

export const MetricTitle = styled.h3`
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

export const MetricTrend = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => {
    switch (props.trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  margin-bottom: 0.25rem;
`;

export const MetricDetail = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

export const OcupacaoStatus = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.status) {
      case 'critico': return '#fee2e2';
      case 'alerta': return '#fef3c7';
      case 'estavel': return '#d1fae5';
      case 'baixa': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'critico': return '#dc2626';
      case 'alerta': return '#92400e';
      case 'estavel': return '#065f46';
      case 'baixa': return '#1e40af';
      default: return '#374151';
    }
  }};
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

export const ChartTitle = styled.h3`
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
`;

export const ChartPlaceholder = styled.div`
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const ChartLoading = styled(ChartPlaceholder)`
  animation: ${pulse} 2s infinite;
`;

export const ChartData = styled.div`
  margin-top: 1rem;
  text-align: left;
  width: 100%;
  max-width: 300px;
`;

export const ChartDataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

export const ChartDataColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color || '#3b82f6'};
`;

export const TableSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
`;

export const TableTitle = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
`;

export const TableLoading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
  animation: ${pulse} 2s infinite;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 800px;

  th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
    white-space: nowrap;
  }

  tr:hover {
    background: #f8fafc;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const CirurgiaBadge = styled.span`
  display: inline-block;
  background: #fee2e2;
  color: #dc2626;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: uppercase;
`;

export const OcupacaoPercentual = styled.span`
  font-weight: 600;
  color: ${props => {
    const percentual = props.percentual || 0;
    if (percentual >= 90) return '#dc2626';
    if (percentual >= 80) return '#d97706';
    if (percentual >= 60) return '#059669';
    return '#374151';
  }};
`;

export const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.status) {
      case 'ocupada': return '#fee2e2';
      case 'disponivel': return '#d1fae5';
      case 'manutencao': return '#fef3c7';
      case 'livre': return '#dbeafe';
      case 'critico': return '#fee2e2';
      case 'alerta': return '#fef3c7';
      case 'estavel': return '#d1fae5';
      case 'baixa': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'ocupada': return '#dc2626';
      case 'disponivel': return '#065f46';
      case 'manutencao': return '#92400e';
      case 'livre': return '#1e40af';
      case 'critico': return '#dc2626';
      case 'alerta': return '#92400e';
      case 'estavel': return '#065f46';
      case 'baixa': return '#1e40af';
      default: return '#374151';
    }
  }};
`;

export const TipoSala = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;

  background-color: ${props => {
    switch (props.tipo) {
      case 'CIRURGIA': return '#fef3c7';
      case 'CONSULTORIO': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.tipo) {
      case 'CIRURGIA': return '#92400e';
      case 'CONSULTORIO': return '#1e40af';
      default: return '#374151';
    }
  }};
`;