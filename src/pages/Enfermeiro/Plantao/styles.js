import styled, { createGlobalStyle } from "styled-components";

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

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
`;

export const FormContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 2.5rem;
  max-width: 700px;
  width: 100%;
  text-align: center;

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
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
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
