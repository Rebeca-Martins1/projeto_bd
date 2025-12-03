import styled, { createGlobalStyle, keyframes } from 'styled-components';

// Animações
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

// Estilos globais
export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    background-color: #f3f4f6; 
    font-family: 'Inter', sans-serif;
    box-sizing: border-box; 
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

// Componentes base
export const Container = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;

  @media (min-width: 1024px) {
    max-width: 1024px; 
  }
`;

export const ConselhoPortalContainer = styled.div`
  width: 100%; 
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
`;

// Conteúdo principal
export const MainContent = styled(Container)`
  padding-top: 3rem;
  padding-bottom: 3rem;
  flex-grow: 1;
`;

export const BackButton = styled.button`
  background-color: #374151;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #1f2937;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-self: center;
`;

export const ExportBtn = styled.button`
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #1d4ed8;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

// Filtros
export const FilterSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  margin-bottom: 2rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
  }
`;

export const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #ffffff;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

// Métricas
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const MetricCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  text-align: center;
`;

export const MetricTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

export const MetricTrend = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    switch (props.trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  margin: 0 0 0.25rem 0;
`;

export const MetricDetail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  background-color: ${props => {
    switch (props.status) {
      case 'alto': return '#10b981';
      case 'moderado': return '#fef3c7';
      case 'baixo': return '#fee2e2';
      case 'critico': return '#fee2e2';
      case 'alerta': return '#fef3c7';
      case 'estavel': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'alto': return '#065f46';
      case 'moderado': return '#92400e';
      case 'baixo': return '#dc2626';
      case 'critico': return '#dc2626';
      case 'alerta': return '#92400e';
      case 'estavel': return '#065f46';
      default: return '#374151';
    }
  }};
`;

// Gráficos
export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ChartCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

export const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

export const ChartContainer = styled.div`
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Componentes de gráfico visual
export const ChartVisual = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 1rem;
`;

export const ChartBar = styled.div`
  flex: 1;
  background-color: ${props => props.color || '#3b82f6'};
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
  height: ${props => props.height || '0'}%;
  min-height: 20px;

  &::after {
    content: '${props => props.value || "0"}';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
  }
`;

export const ChartLoading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  animation: ${pulse} 2s infinite;
`;

// Tabela
export const TableSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  margin-bottom: 2rem;
  overflow-x: auto;
`;

export const TableTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 800px;

  th {
    background-color: #f9fafb;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    color: #6b7280;
    white-space: nowrap;
  }

  tr:hover {
    background-color: #f9fafb;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const PercentValue = styled.span`
  font-weight: 600;
  color: ${props => {
    const percentual = props.value || 0;
    if (percentual >= 90) return '#dc2626';
    if (percentual >= 80) return '#d97706';
    if (percentual >= 60) return '#059669';
    return '#374151';
  }};
`;

export const EmergenciaBadge = styled.span`
  display: inline-block;
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: uppercase;
`;

export const TipoCirurgiaBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  background-color: ${props => {
    switch (props.tipo) {
      case 'EMERGENCIA': return '#fee2e2';
      case 'ELETIVA': return '#d1fae5';
      case 'URGENCIA': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.tipo) {
      case 'EMERGENCIA': return '#dc2626';
      case 'ELETIVA': return '#065f46';
      case 'URGENCIA': return '#92400e';
      default: return '#374151';
    }
  }};
`;

export const DuracaoBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  background-color: ${props => {
    const duracao = props.duracao || 0;
    if (duracao > 240) return '#fee2e2'; // > 4h
    if (duracao > 120) return '#fef3c7'; // > 2h
    if (duracao > 60) return '#d1fae5'; // > 1h
    return '#f3f4f6';
  }};

  color: ${props => {
    const duracao = props.duracao || 0;
    if (duracao > 240) return '#dc2626';
    if (duracao > 120) return '#92400e';
    if (duracao > 60) return '#065f46';
    return '#374151';
  }};
`;