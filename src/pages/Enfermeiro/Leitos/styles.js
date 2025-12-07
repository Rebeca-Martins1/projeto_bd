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

// Novo nome para o container principal
export const MeusLeitosContainer = styled.div`
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
    color: #1c2541;
    margin-bottom: 8px;
  }

  & > p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 40px;
  }
`;

// Contêiner simples para centralizar o card de leito
export const LeitoGrid = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 20px;
`;

// Card Container com borda dinâmica
export const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  width: 100%;
  max-width: 500px; /* Limita o tamanho do card de leito */
  display: flex;
  flex-direction: column;
  /* Cor da borda com base no tipo de leito */
  border-left: 5px solid ${(props) => (props.isUTI ? '#dc3545' : '#4a67d0')}; 
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
  flex-grow: 1;

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

// === ESTILOS DE AÇÃO (MANTIDOS) ===
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

// === LÓGICA DO STATUS BADGE PARA LEITOS ===
export const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  
  background-color: ${(props) => {
    const status = props.status?.toUpperCase() || "OCUPADO";
    if (status === "LIVRE") return "#28a745"; // Verde para livre
    return "#dc3545"; // Vermelho/Padrão para ocupado
  }};
  
  color: #fff; /* Texto branco para badges de status */
`;