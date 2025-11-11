import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
  }
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const FormContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
`;

export const FormBox = styled.form`
  background: #fff;
  border-radius: 0.75rem;
  padding: 2.5rem 3rem;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;

  h2 {
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
  }
`;

export const SubmitButton = styled.button`
  margin-top: 2rem;
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1e40af;
  }
`;

export const Resultado = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #93c5fd;
  background-color: #eff6ff;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  strong {
    color: #1e3a8a;
    margin-bottom: 0.25rem;
  }

  span {
    color: #1d4ed8;
    font-weight: 600;
  }
`;

export const Mensagem = styled.p`
  margin-top: 1rem;
  color: #065f46;
  font-weight: 500;
`;
