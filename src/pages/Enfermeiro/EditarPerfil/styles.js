import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    background: #f8fafc;
    font-family: "Inter", sans-serif;
    margin: 0;
    padding: 0;
  }
`;

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
`;
export const BackButton = styled.button`
  background: #e2e8f0;
  color: #1c2541;
  border: none;
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    background: #cfd8e3;
  }
`;

export const FormCard = styled.form`
  background: #ffffff;
  width: 100%;
  max-width: 700px;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
  animation: fadeIn .25s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 15px;
  margin-top: 5px;
  color: #1c2541;
  border-left: 4px solid #1c2541;
  padding-left: 8px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;

  label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #334155;
  }

  input, textarea, select { /* <-- ADICIONADO 'select' aqui */
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 15px;
    outline: none;
    transition: .2s;
    background-color: white; /* Garante que o select não fique transparente */

    &:focus {
      border-color: #1c2541;
      box-shadow: 0 0 0 2px rgba(28,37,65,0.15);
    }
  }

  textarea {
    min-height: 90px;
    resize: none;
  }
`;

export const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: #1c2541;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
  font-weight: 600;
  transition: .2s;

  &:hover {
    background: #273469;
  }
`;