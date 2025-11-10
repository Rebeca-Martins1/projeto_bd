import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  margin-top: 75px;
  margin-block-end: 75px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const ItemStructure = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

export const TitleSection = styled.div`
  text-align: center;
  max-width: 600px;        
  margin: 0 auto 30px;     
  line-height: 1.6;       
  letter-spacing: 0.5px;  
  padding: 20px;         

  h2 {
    color: #243b80;
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  h1 {
    color: #243b80;
    font-size: 36px;      
    font-weight: bold;
    margin: 10px 0;
    letter-spacing: 1px;    
  }

  p {
    color: #555;
    font-size: 15px;
    margin-top: 10px;
  }
`;
export const h1 = styled.div`
    color: #fff;
    font-size: 32px;
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  text-align: center;
  margin-right: 30%;
  margin-block-end: 20px;
  h2 {
    font-size: 24px;
    color: #243b80;
    text-align: center;
    margin-bottom: 20px;
  }

  input,
  select {
    padding: 14px 28px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: 0.3s;
  }

  input:focus,
  select:focus {
    border-color: #243b80;
    box-shadow: 0 0 0 2px rgba(36, 59, 128, 0.2);
  }

  .signup {
    text-align: center;
    font-size: 14px;
    margin-top: 5px;

    button {
      background: none;
      border: none;
      color: #243b80;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
  }
`;
export const Button = styled.button`
  background-color: #243b80;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #2f4fb1;
    transform: scale(1.02);
  }
`;
export const Form_cadastro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;                
  max-width: 1000px;
  padding: 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);

  h1 {
    font-size: 20px;
    color: #243b80;
  }

  form {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
    margin-top: 20px;
  }

  input,
  select {
    flex: 1 1 calc(50% - 10px);
    padding: 12px 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: 0.3s;

    &:focus {
      border-color: #243b80;
      box-shadow: 0 0 0 2px rgba(36, 59, 128, 0.15);
    }
  }

  .full {
    flex: 1 1 100%;
  }

  button {
    flex: 1 1 100%;
    background-color: #243b80;
    color: white;
    font-weight: bold;
    padding: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #2f4fb1;
      transform: scale(1.02);
    }
  }

  @media (max-width: 768px) {
    form {
      flex-direction: column;
    }
    input,
    select {
      flex: 1 1 100%;
    }
  }
`;
