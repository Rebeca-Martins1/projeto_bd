import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif; 
  }

  body, html, #root {
    min-height: 100vh;
    width: 100%;
    background-color: #f4f7f6;
  }
`;

// Renomeado
export const MinhaEscalaContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const MainContent = styled.main`
  flex: 1; 
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  & > h1 {
    font-size: 2.5rem;
    color: #1c2541; /* Cor mais forte para títulos */
    margin-bottom: 8px;
  }

  & > p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 40px;
  }
`;

export const CirurgiaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px; 
`;

export const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  /* Cor da borda alterada para o tema de Enfermeiro */
  border-left: 5px solid #4a67d0; 
  transition: all 0.2s ease-in-out;

  &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeader = styled.div`
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;

  & > h3 {
    font-size: 1.5rem; 
    color: #1c2541;
    margin-bottom: 4px;
  }
  
  & > p {
    font-size: 1.0rem; 
    color: #4a67d0; 
    font-weight: 500;
  }
`;

export const CardDetalhes = styled.div`
  margin-bottom: 15px;
  flex-grow: 1; /* Permite que os detalhes ocupem o espaço necessário */

  & > p {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
  }

  & > p > strong {
    color: #333;
    min-width: 80px;
    display: inline-block;
  }
`;

export const TeamSection = styled.div`
  font-size: 1rem;
  color: #333;

  & > strong {
    margin-bottom: 12px;
    display: block;
  }
`;

export const TeamList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

export const TeamMember = styled.li`
  font-size: 0.95rem;
  color: #666;
  background-color: #f9f9f9;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
`;

// === NOVOS ESTILOS PARA AÇÕES ===
export const ActionArea = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid #f1f5f9;
`;

export const ActionBtn = styled.button`
    background: ${(props) => (props.secondary ? '#e2e8f0' : '#4a67d0')};
    color: ${(props) => (props.secondary ? '#1c2541' : '#fff')};
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
    white-space: nowrap;

    &:hover {
        opacity: 0.85;
    }
`;

// === LÓGICA DO STATUS BADGE PARA ENFERMAGEM ===
export const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  
  background-color: ${(props) => {
    const status = props.status?.toUpperCase() || "AGENDADO";
    if (status === "CONCLUÍDO") return "#10b981"; // Verde
    if (status === "EM ANDAMENTO") return "#f59e0b"; // Laranja
    if (status === "CANCELADO") return "#ef4444"; // Vermelho
    if (status === "EM PREPARO") return "#3b82f6"; // Azul
    return "#e2e8f0"; // Padrão: Cinza claro
  }};
  
  color: ${(props) => {
    const status = props.status?.toUpperCase() || "AGENDADO";
    if (status === "AGENDADO") return "#475569";
    if (status === "CONCLUÍDO" || status === "EM PREPARO") return "#fff";
    return "#333";
  }};
`;