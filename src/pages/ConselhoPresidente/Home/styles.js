import styled, { createGlobalStyle } from 'styled-components';

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

// Container principal
export const ConselhoPortalContainer = styled.div`
  width: 100%; 
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
`;

// Conteúdo principal
export const MainContent = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  flex-grow: 1;
`;

// Cabeçalho da página
export const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }
    p {
      font-size: 0.875rem;
    }
  }
`;

// Barra de filtros
export const FilterBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
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
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.variant === 'secondary' ? '#6b7280' : '#2563eb'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#4b5563' : '#1d4ed8'};
  }

  svg {
    flex-shrink: 0;
  }
`;

// Grid de relatórios
export const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Card de relatório
export const ReportCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  svg {
    width: 24px;
    height: 24px;
    color: #2563eb;
    flex-shrink: 0;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

export const CardContent = styled.div`
  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
    min-height: 40px;
  }
`;

// Novo estilo para o botão de ação
export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #1d4ed8;
  }

  svg {
    flex-shrink: 0;
  }
`;
