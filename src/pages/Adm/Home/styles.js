import styled, { createGlobalStyle } from "styled-components";

// 🔹 Estilos Globais
export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
  }
`;

// 🔹 Container principal
export const PacientePortalContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// 🔹 Cabeçalho
export const TopHeader = styled.header`
  background-color: #1f2937;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

export const TopHeaderContent = styled.div`
  width: 90%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  gap: 0.5rem;
`;

export const LogoTitle = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
`;

export const LogoutBtn = styled.button`
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;

  &:hover {
    background-color: #dc2626;
  }
`;

// 🔹 Conteúdo Principal
export const MainContent = styled.main`
  flex-grow: 1;
  width: 90%;
  max-width: 1000px;
  margin: 3rem auto 2rem auto; /* margem inferior reduzida */
`;

export const WelcomeMessage = styled.div`
  margin-bottom: 2.5rem;
  
  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }
  p {
    font-size: 1.125rem;
    color: #4b5563;
    margin: 0;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// 🔹 Card de ação
export const ActionCardContainer = styled.div`
  background-color: #fff;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-4px);
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: #4b5563;
    margin-bottom: 1rem;
  }

  svg {
    color: #2563eb;
  }
`;

export const ActionCardIcon = styled.div`
  color: #2563eb;
  margin-bottom: 0.5rem;
`;

export const ActionCardButton = styled.button`
  background-color: #374151;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #1f2937;
  }
`;

// 🔹 Rodapé
export const Footer = styled.footer`
  background-color: #1f2937;
  color: #d1d5db;
  padding: 1rem 0;
`;

export const FooterGrid = styled.div`
  width: 90%;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(2, 1fr);
`;

export const FooterCol = styled.div`
  h5 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p, li {
    font-size: 0.875rem;
    color: #d1d5db;
  }
`;
