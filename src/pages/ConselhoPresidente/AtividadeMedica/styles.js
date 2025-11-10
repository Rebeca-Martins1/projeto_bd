import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
  }
`;

export const ConselhoPortalContainer = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
`;

export const Header = styled.header`
  background-color: #1f2937;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const BackButton = styled.button`
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #4b5563;
  }
`;

export const Title = styled.div`
  text-align: center;
  flex: 1;
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    color: #d1d5db;
    font-size: 0.875rem;
  }
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ExportBtn = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #1d4ed8;
  }
`;

export const FilterSection = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  margin: 1rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }
`;

export const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
`;

export const MainContent = styled.div`
  padding: 0 2rem 2rem 2rem;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const MetricCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #2563eb;
`;

export const MetricTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

export const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

export const MetricTrend = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: ${props => 
    props.trend === 'up' ? '#d1fae5' : 
    props.trend === 'down' ? '#fee2e2' : 
    '#f3f4f6'};
  color: ${props => 
    props.trend === 'up' ? '#065f46' : 
    props.trend === 'down' ? '#991b1b' : 
    '#374151'};
`;

export const MetricDetail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

export const ChartPlaceholder = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.875rem;
  border: 1px dashed #d1d5db;
`;

export const TableSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

export const TableTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  td {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  tr:hover {
    background-color: #f9fafb;
  }
`;

export const TrendBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.trend === 'up' ? '#d1fae5' : 
    props.trend === 'down' ? '#fee2e2' : 
    '#f3f4f6'};
  color: ${props => 
    props.trend === 'up' ? '#065f46' : 
    props.trend === 'down' ? '#991b1b' : 
    '#374151'};
`;

export const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.status === 'ativo' ? '#d1fae5' : 
    props.status === 'ferias' ? '#fef3c7' : 
    '#f3f4f6'};
  color: ${props => 
    props.status === 'ativo' ? '#065f46' : 
    props.status === 'ferias' ? '#92400e' : 
    '#374151'};
`;
