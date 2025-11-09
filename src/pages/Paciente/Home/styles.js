import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;              
  width: 100vw;  
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 100px;
`;

export const ItemStructure = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

export const h1 = styled.div`
    color: #fff;
    font-size: 32px;
`;

export const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 30px;
    border-radius: 10px;
    background-color: #2e2d4e;
    max-width: 50%;
    width: 400px;
    margin-bottom: 20px;
`;

export const Button = styled.div`
    display: flex;              
    align-items: center;         
    justify-content: center; 
    border-radius: 30px;
    background-color: #8b8ae1;
    height: 40px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    &:hover {
      background-color: #a19fe0ff;
      transform: scale(1.02);
    }
`;