import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
`;

export const TopBar = styled.div`
  width: 100%;
  background: #071f52ff;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

export const LogoutBtn = styled.button`
  background: #1e40af;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  /* <-- centraliza verticalmente */
  padding: 30px 20px;
`;

export const Header = styled.h1`
  color: #0f1f39;
  font-size: 28px;
  margin-bottom: 6px;
`;

export const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin-bottom: 35px;
`;

export const GridArea = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); /* Cards maiores */
  gap: 25px;
  width: 100%;
  max-width: 700px; /* <-- reduz largura máxima para centralizar */
  justify-content: center; /* <-- centraliza a grid */
`;


export const Card = styled.div`
  background: white;
  border: 1px solid #d1dceb;
  border-radius: 12px;
  padding: 25px 15px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: 0.2s;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  svg {
    color: #2563eb;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: #0f1f39;
  }

  &:hover {
    border-color: #2563eb;
    transform: translateY(-4px);
  }
`;
