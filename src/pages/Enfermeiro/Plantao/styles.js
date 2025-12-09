import styled, { createGlobalStyle, keyframes } from "styled-components";

// --- ANIMAÇÃO DE CARREGAMENTO ---
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

export const ContainerPlantao = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// ATUALIZADO: Agora suporta flex-wrap para ficar responsivo (lado a lado no PC, um embaixo do outro no celular)
export const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  gap: 2rem; /* Espaço entre o formulário e a lista */
  flex-wrap: wrap; /* Permite quebrar linha em telas menores */
`;

export const FormContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 2.5rem;
  /* Ajuste para funcionar bem lado a lado */
  flex: 1;
  min-width: 320px; 
  max-width: 500px;
  width: 100%;
  text-align: center;
  height: fit-content;

  h1 {
    font-size: 1.75rem;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

// --- NOVO COMPONENTE: Container da Lista (Lado Direito) ---
export const ListaContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 2rem;
  flex: 1;
  min-width: 320px;
  max-width: 600px; /* Um pouco mais largo que o form para caber os cards */
  width: 100%;
  height: fit-content;
  max-height: 80vh; /* Limita a altura para scrollar internamente */
  display: flex;
  flex-direction: column;

  h2 {
    font-size: 1.5rem;
    color: #1f2937; /* Mesmo cinza escuro do h1 */
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  /* Área de Scroll */
  .lista-scroll {
    overflow-y: auto;
    padding-right: 8px;
    flex: 1;
    
    /* Estilo da barra de rolagem */
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    &::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  }
`;

// --- NOVO COMPONENTE: Card do Procedimento ---
export const CardProcedimento = styled.div`
  background: #f9fafb; /* Fundo levemente cinza */
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  transition: transform 0.2s, box-shadow 0.2s;
  
  /* Borda colorida baseada no status */
  border-left: 5px solid ${props => 
    props.status === 'Realizado' ? '#10b981' :  // Verde
    props.status === 'Em andamento' ? '#f59e0b' : // Amarelo
    '#ef4444'}; // Vermelho (Pendente)

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    background: #fff;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;

    .hora {
      font-weight: 700;
      color: #374151;
      font-size: 0.9rem;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      background-color: #e5e7eb;
      color: #4b5563;
    }
  }

  .card-body {
    h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-row {
      display: flex;
      align-items: center;
      color: #4b5563;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      
      strong { margin-right: 4px; color: #374151; }
      svg { margin-right: 6px; color: #6b7280; }
    }
  }
`;

// --- NOVO COMPONENTE: Estados de Loading e Vazio ---
export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2563eb; /* Azul do seu tema */
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
`;

// --- COMPONENTES ORIGINAIS MANTIDOS ---

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #374151;
    display: block;
    margin-bottom: 0.25rem;
    text-align: left;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    font-size: 0.95rem;
    transition: border-color 0.3s;

    &:focus {
      border-color: #2563eb;
      outline: none;
      background: #fff;
    }
  }
`;

export const InfoBox = styled.div`
  background-color: #e0f2fe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  text-align: left;
  border-radius: 4px;

  strong {
    display: block;
    color: #1e3a8a;
  }

  p {
    margin: 0.25rem 0 0;
    color: #1e40af;
  }
`;

export const Message = styled.div`
  /* Ajustei para aceitar prop de erro se quiser (opcional) */
  background-color: ${props => props.error ? '#fee2e2' : '#fef3c7'};
  color: ${props => props.error ? '#991b1b' : '#92400e'};
  border: 1px solid ${props => props.error ? '#fca5a5' : '#fcd34d'};
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
`;

export const Button = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.3s;

  &:hover {
    background-color: #1d4ed8;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

export const Voltar = styled.button`
  margin-top: 1rem;
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
  }
`;