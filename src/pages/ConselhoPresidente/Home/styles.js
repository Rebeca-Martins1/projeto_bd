import styled, { createGlobalStyle, keyframes } from "styled-components";

export const GlobalStyles = createGlobalStyle`
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

  html, body, #root {
    height: 100%;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

export const ConselhoPortalContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
  }
`;

export const LoadingMessage = styled.div`
  text-align: center;
  color: #3b82f6;
  font-weight: 500;
  margin-top: 1rem;
`;

export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
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

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${props => props.variant === 'secondary' ? '#d1d5db' : '#3b82f6'};
  border-radius: 8px;
  background: ${props => props.variant === 'secondary' ? 'white' : '#3b82f6'};
  color: ${props => props.variant === 'secondary' ? '#374151' : 'white'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#f9fafb' : '#2563eb'};
    border-color: ${props => props.variant === 'secondary' ? '#9ca3af' : '#2563eb'};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

export const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ReportCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  opacity: ${props => props.disabled ? 0.7 : 1};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-4px)'};
    box-shadow: ${props => props.disabled ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 8px 25px rgba(0, 0, 0, 0.15)'};
    border-color: ${props => props.disabled ? '#e2e8f0' : '#3b82f6'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  svg {
    color: #3b82f6;
    width: 24px;
    height: 24px;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
`;

export const CardContent = styled.div`
  p {
    color: #64748b;
    margin-bottom: 1.5rem;
    line-height: 1.5;
    min-height: 3em;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  background: transparent;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-left: auto;
`;

export const StatsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const StatsTitle = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

export const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

export const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
`;