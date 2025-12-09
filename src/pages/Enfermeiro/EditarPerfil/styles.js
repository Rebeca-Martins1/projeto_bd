import styled from "styled-components";

export const GlobalStyles = styled.div`
  /* Reset básico se necessário */
`;

export const EnfermeiroPortalContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const WelcomeMessage = styled.div`
  margin-bottom: 40px;
  text-align: center;

  h1 {
    color: #003366;
    font-size: 2rem;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
`;

export const ActionCardContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }

  h3 {
    margin: 15px 0 10px;
    color: #003366;
  }

  p {
    color: #777;
    font-size: 0.9rem;
    margin-bottom: 20px;
    flex: 1;
  }
`;

export const ActionCardIcon = styled.div`
  color: #007bff;
  font-size: 40px;
  margin-bottom: 10px;
  
  svg {
    width: 50px;
    height: 50px;
  }
`;

export const ActionCardButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
`;