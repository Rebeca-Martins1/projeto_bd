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

export const MinhasConsultasContainer = styled.div`
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

export const ConsultaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px; 
`;

export const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-left: 5px solid #007bff;
`;

export const CardHeader = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;

  & > h3 {
    font-size: 1.5rem; 
    color: #222;
    margin-bottom: 4px;
  }
`;

export const CardDetalhes = styled.div`
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