import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f6f6;
`;

export const Content = styled.div`
  flex: 1;
  max-width: 900px;
  margin: 40px auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #1f2937;
    color: white;
    padding: 20px;
    align-items: center;
  }

  td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
    align-items: center;
  }
`;

export const DesativarBtn = styled.button`
  padding: 8px 16px;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-width: 100px;

  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;

export const AtivarBtn = styled.button`
  padding: 8px 16px;
  background: #2a9d8f; 
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-width: 100px;

  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;

export const Error = styled.p`
  color: red;
`;

export const Success = styled.p`
  color: green;
`;
