import React, { useState } from "react";
import * as S from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CadastroSala() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    n_sala: "",
    tipo: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/salas", {
        n_sala: Number(formData.n_sala),
        tipo: formData.tipo,
      });

      
      navigate("/homeadm");
    } catch (err) {
      console.error("Erro ao cadastrar sala:", err);
      alert("Erro ao cadastrar sala. Verifique os dados e tente novamente.");
    }
  };

  return (
    <S.PageContainer>
      <S.GlobalStyles />
      <Header />

      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            <h2>Cadastro de Sala</h2>
            <p>Preencha as informações da sala</p>
          </S.FormHeader>

          <S.InputGroup>
            <label>Número da Sala</label>
            <input
              type="number"
              name="n_sala"
              value={formData.n_sala}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <label>Tipo de Sala</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="Consultorio">Sala de consultorio</option>
              <option value="Cirurgia">Sala de cirurgia</option>
            </select>
          </S.InputGroup>

          <S.SubmitBtn type="submit">Cadastrar Sala</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>

      <Footer />
    </S.PageContainer>
  );
}
