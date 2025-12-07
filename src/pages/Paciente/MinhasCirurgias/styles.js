import styled, { createGlobalStyle } from 'styled-components';

// ---------------------------------------------
// 1. ESTILOS GLOBAIS
// ---------------------------------------------
export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    // Garanta que a fonte 'Inter' esteja importada no seu projeto
    font-family: 'Inter', sans-serif; 
  }

  body, html, #root {
    min-height: 100vh;
    width: 100%;
    background-color: #f4f7f6; /* Fundo cinza claro suave */
  }

  h2 {
    font-size: 1.8rem;
    color: #444;
    margin-top: 30px;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid #ddd;
  }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 30px 0;
  }
`;

// ---------------------------------------------
// 2. LAYOUT PRINCIPAL
// ---------------------------------------------
export const MinhasCirurgiasContainer = styled.div`
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
    color: #333;
    margin-bottom: 8px;
  }

  & > p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 40px;
  }
`;

export const CirurgiaList = styled.div`
  display: grid;
  // Layout responsivo: no mínimo 350px por coluna, preenche o espaço
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px; 
`;

// ---------------------------------------------
// 3. ESTILOS DO CARD DE CIRURGIA
// ---------------------------------------------
export const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* Sombra mais destacada */
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-left: 6px solid #007bff; /* Borda azul primária */
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-3px); /* Efeito sutil ao passar o mouse */
  }
`;

export const CardHeader = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  & > h3 {
    font-size: 1.4rem; 
    color: #222;
    margin-bottom: 0;
  }

  & > p {
    font-size: 1rem; 
    color: #666; 
    margin-top: 5px;
  }
`;

export const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${(props) => {
    // APROVADA (Verde)
    if (props.aprovada) return "#28a745"; 
    // REJEITADA ou CANCELADA (Vermelho)
    if (props.status && (props.status.includes("REJEITADA") || props.status.includes("CANCELADA"))) return "#dc3545"; 
    // EM ANÁLISE / PENDENTE (Amarelo/Laranja)
    return "#ffc107"; 
  }};
  
  color: ${(props) => {
    // Se for PENDENTE/ANÁLISE, use texto escuro para contraste no fundo amarelo
    if (props.status && !props.aprovada && !props.status.includes("REJEITADA")) return "#333";
    // Caso contrário (Aprovado ou Rejeitado), use texto branco
    return "#fff";
  }};
`;

export const CardDetalhes = styled.div`
  margin-bottom: 15px;
  padding-top: 5px;

  & > p {
    font-size: 1rem;
    color: #555;
    line-height: 1.8;
    display: flex;
    gap: 5px;
  }

  & > p > strong {
    color: #333;
    font-weight: 600;
    min-width: 140px; /* Garante que os rótulos fiquem alinhados */
    display: inline-block;
  }
`;

// ---------------------------------------------
// 4. SEÇÕES DESNECESSÁRIAS NO PACIENTE (Removidas/Opcionais)
// Removi TeamSection, TeamList e TeamMember, pois o foco do paciente é a própria cirurgia.
// Se precisar de uma seção para a equipe, reintroduza-as.
// ---------------------------------------------