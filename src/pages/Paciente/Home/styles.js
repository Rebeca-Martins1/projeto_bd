import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  // Certifique-se de que o background está preenchendo TUDO.
  // Como o fundo roxo está lá, ele é o background do <body> ou de um elemento pai.
  // Mantenha o background, ele deve ser suficiente.
  background: #f8fafc; 
  
  display: flex;
  flex-direction: column;
  align-items: center; // Isso centraliza o conteúdo horizontalmente.
  justify-content: flex-start;
  padding: 40px 20px;
`;


export const Header = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f1f39;
  margin-bottom: 6px;
  text-align: center;
`;

export const Subtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 40px;
  text-align: center;
`;



export const GridArea = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 900px; /* <--- REMOVA ou AUMENTE este limite */
  padding: 0 10px;
`;

export const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ef;
  border-radius: 12px;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  color: #0f1f39;
  cursor: pointer;
  font-size: 17px;
  font-weight: 600;

  & > svg {
    color: #2563eb;
    margin-bottom: 10px;
  }

  &:hover {
    border-color: #2563eb;
    transform: translateY(-4px);
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.1);
  }

  & span {
    font-size: 15px;
  }
`;
