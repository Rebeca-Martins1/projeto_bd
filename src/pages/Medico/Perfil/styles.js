import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
`;

export const Content = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 10px #00000022;
`;

export const Error = styled.div`
  background: #ffdddd;
  color: #b30000;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

export const Success = styled.div`
  background: #ddffdd;
  color: #008800;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

export const InputGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;

  label {
    font-weight: bold;
    margin-bottom: 5px;
  }

  input {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
`;

export const EditBtn = styled.button`
  width: 100%;
  background: #1f2937;
  color: white;
  border: none;
  padding: 12px;
  font-size: 18px;
  margin-top: 15px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #1f2937;
  }
`;
