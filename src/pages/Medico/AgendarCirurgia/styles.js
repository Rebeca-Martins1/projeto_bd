import styled, { createGlobalStyle } from "styled-components";

// Reutiliza o estilo global da Home
export const GlobalStyles = createGlobalStyle`
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

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex-grow: 1;
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
`;

export const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.875rem;
    color: #1f2937;
    margin: 0;
  }

  p {
    color: #4b5563;
    margin-top: 0.5rem;
  }
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #1f2937;
  }

  input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 1rem;
    background-color: #f9fafb;
    transition: border-color 0.3s;

    &:focus {
      border-color: #2563eb;
      outline: none;
      background-color: #fff;
    }
  }

  textarea {
    resize: vertical;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const SubmitButton = styled.button`
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

export const CancelButton = styled.button`
  background-color: #6b7280;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #4b5563;
  }
`;
