import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    background-color: #f4f5f9;
    font-family: 'Poppins', sans-serif;
  }
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const TopHeader = styled.header`
  background-color: #1c2541;
  color: white;
  padding: 1rem 2rem;
`;

export const TopHeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LogoTitle = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
`;

export const BackBtn = styled.button`
  background-color: #ff3b3b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;

  &:hover {
    background-color: #d42f2f;
  }
`;

export const FormContainer = styled.main`
  width: 100%;
  height: 100vh;        
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f4f4f4;   
  margin-top: 50px;  
  margin-block-end: 50px;  
`;

export const FormCard = styled.form`
  background-color: white;
  padding: 2rem 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 700px;       
  max-width: 95%;     
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 20px;
  justify-items: center;
`;

export const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  h2 {
    margin: 0.5rem 0;
    color: #1c2541;
  }

  p {
    color: #666;
    font-size: 0.9rem;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.0rem;
  width: 100%;
  label {
    margin-bottom: 0.4rem;
    font-weight: 500;
  }

  input, select, textarea {
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border 0.3s;

    &:focus {
      border-color: #1c2541;
    }
  }

  textarea {
    resize: none;
    height: 80px;
  }
`;

export const SubmitBtn = styled.button`
  background-color: #1c2541;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #283b73;
  }
`;
