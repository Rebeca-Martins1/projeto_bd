import styled from "styled-components";

// Estilos necessários para o componente PerfilEnfermeiro/index.jsx
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

export const Content = styled.div`
  flex: 1;
  width: 100%;
  max-width: 600px;
  margin: 40px auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  h1 {
    color: #003366;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
  }

  input {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #007bff;
    }

    &:disabled {
      background-color: #e9ecef;
      color: #666;
      cursor: not-allowed;
    }
  }
`;

export const EditBtn = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #003366;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;

  &:hover {
    background-color: #002244;
  }
`;

export const Error = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #f5c6cb;
`;

export const Success = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #c3e6cb;
`;

// O seu componente não usa GlobalStyles, mas é bom manter a exportação limpa
// export const GlobalStyles = styled.div``;