import React, { useState } from "react";
import * as S from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";

export default function CadastroLeito() {
  const [formData, setFormData] = useState({
    n_sala: "",
    tipo: "",
    quant_paciente: "",
    capacidade: "",
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
      await axios.post("http://localhost:5000/leitos", {
        n_sala: Number(formData.n_sala),
        tipo: formData.tipo,
        quant_paciente: Number(formData.quant_paciente) || 0,
        capacidade: Number(formData.capacidade),
      });

      alert("Leito cadastrado com sucesso!");
      setFormData({ n_sala: "", tipo: "", quant_paciente: "", capacidade: "" });
    } catch (err) {
      console.error("Erro ao cadastrar leito:", err);
      alert("Erro ao cadastrar leito. Verifique os dados e tente novamente.");
    }
  };

  return (
    <S.PageContainer>
      <S.GlobalStyles />
      <Header />

      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            <h2>Cadastro de Leito</h2>
            <p>Preencha as informações do leito</p>
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
            <label>Tipo de Leito</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="UTI">Leito UTI</option>
              <option value="ENFERMARIA">Leito Enfermaria</option>
            </select>
          </S.InputGroup>

          <S.InputGroup>
            <label>Capacidade Máxima</label>
            <input
              type="number"
              name="capacidade"
              value={formData.capacidade}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

          <S.SubmitBtn type="submit">Cadastrar Leito</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>

      <Footer />
    </S.PageContainer>
  );
}
