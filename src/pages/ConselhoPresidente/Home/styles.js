import styled, { createGlobalStyle } from 'styled-components';

// Estilos globais (igual ao do médico)
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

// Componentes base (iguais ao do médico)
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

// Cabeçalho superior (igual ao do médico)
export const TopHeader = styled.header`
  background-color: #1f2937;
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  flex-shrink: 0;
`;

export const TopHeaderContent = styled(Container)`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const LogoTitle = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
`;

export const TopNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;

  a {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.3s;
  }
  a:hover {
    color: #ffffff;
  }
  a.font-semibold {
    font-weight: 600;
  }
`;

export const EmergencyButton = styled.a`
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.3s;
  text-decoration: none;

  &:hover {
    background-color: #1d4ed8;
  }
`;

export const MainNav = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
`;

export const MainNavContent = styled(Container)`
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    padding: 1rem 0;
    margin: 0;
    gap: 1.5rem;
  }
  li a {
    padding-bottom: 0.5rem; 
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
  }
  li a:hover {
    color: #111827;
  }
  li a.active {
    color: #2563eb;
    border-bottom: 2px solid #2563eb;
  }
  @media (min-width: 768px) {
    ul {
      justify-content: flex-start;
      gap: 2rem;
    }
  }
`;

// Conteúdo principal
export const MainContent = styled(Container)`
  padding-top: 3rem;
  padding-bottom: 3rem;
  flex-grow: 1;
`;

export const PageHeader = styled.div`
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

// Cards de relatórios (estilo igual aos cards do médico)
export const ReportGrid = styled.div`
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

export const ReportCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  svg {
    color: #2563eb;
    width: 1.5rem;
    height: 1.5rem;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

export const CardContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  p {
    font-size: 0.875rem;
    color: #4b5563;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }
`;

export const ActionButton = styled.button`
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
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;

  &:hover {
    background-color: #1f2937;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

// Rodapé (igual ao do médico)
export const Footer = styled.footer`
  background-color: #1f2937;
  color: #d1d5db;
  padding-top: 3rem;
  padding-bottom: 2rem;
  margin-top: 4rem;
  flex-shrink: 0;
`;

export const FooterGrid = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const FooterCol = styled.div`
  h5 {
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.75rem 0;
  }
  
  p, li {
    font-size: 0.875rem;
    margin: 0;
  }
  
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s;
  }
  
  a:hover {
    color: #ffffff;
  }
  
  input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    color: #1f2937;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    border: none;
  }
  
  input:focus {
    outline: none;
  }
`;

export const FooterBottom = styled(Container)`
  border-top: 1px solid #374151;
  margin-top: 2rem;
  padding-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
`;