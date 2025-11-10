import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { FaUserMd, FaUserNurse } from "react-icons/fa";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";

export default function CadastroProfissional() {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState(""); // "medico" ou "enfermeiro"
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    telefone: "",
    email: "",
    sexo: "",
    senha: "",
    crm: "",
    coren: "",
    especialidade: "",
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
      // 🔹 1. Cadastra na tabela PESSOA
      await axios.post("http://localhost:3001/pessoa", {
        cpf: formData.cpf,
        nome: formData.nome,
        tipo: tipo.toUpperCase(), // "MEDICO" ou "ENFERMEIRO"
        telefone: formData.telefone,
        email: formData.email,
        sexo: formData.sexo,
        senha: formData.senha,
      });

      // 🔹 2. Dependendo do tipo, cadastra nas tabelas específicas
      if (tipo === "medico") {
        await axios.post("http://localhost:3001/medico", {
          cpf: formData.cpf,
          crm: formData.crm,
          disponibilidade: true,
          especialidade: formData.especialidade,
        });
      } else if (tipo === "enfermeiro") {
        await axios.post("http://localhost:3001/enfermeiro", {
          cpf: formData.cpf,
          coren: formData.coren,
          disponivel: true,
          especialidade: formData.especialidade,
        });
      }

      alert(`${tipo === "medico" ? "Médico" : "Enfermeiro"} cadastrado com sucesso!`);
      navigate("/homeadmin");
    } catch (err) {
      console.error("Erro ao cadastrar profissional:", err);
      alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
    }
  };

  return (
    <S.PageContainer>
      <S.GlobalStyles />
      <Header />

      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            {tipo === "enfermeiro" ? (
              <FaUserNurse size={32} color="#1c2541" />
            ) : (
              <FaUserMd size={32} color="#1c2541" />
            )}
            <h2>Cadastro de Profissional</h2>
            <p>Preencha os dados para cadastrar médico ou enfermeiro</p>
          </S.FormHeader>

          {/* Escolher tipo */}
          <S.InputGroup>
            <label>Tipo de Profissional</label>
            <select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="medico">Médico</option>
              <option value="enfermeiro">Enfermeiro</option>
            </select>
          </S.InputGroup>

          {/* Dados básicos */}
          <S.InputGroup>
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <label>Telefone</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

          <S.InputGroup>
            <label>Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} required>
              <option value="">Selecione...</option>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
              <option value="O">Outro</option>
            </select>
          </S.InputGroup>

          <S.InputGroup>
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

          {/* Campos específicos */}
          {tipo === "medico" && (
            <>
              <S.InputGroup>
                <label>CRM</label>
                <input
                  type="text"
                  name="crm"
                  value={formData.crm}
                  onChange={handleChange}
                  required
                />
              </S.InputGroup>

              <S.InputGroup>
                <label>Especialidade</label>
                <input
                  type="text"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  placeholder="Ex: Cardiologia, Pediatria..."
                  required
                />
              </S.InputGroup>
            </>
          )}

          {tipo === "enfermeiro" && (
            <>
              <S.InputGroup>
                <label>COREN</label>
                <input
                  type="text"
                  name="coren"
                  value={formData.coren}
                  onChange={handleChange}
                  required
                />
              </S.InputGroup>

              <S.InputGroup>
                <label>Especialidade</label>
                <input
                  type="text"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  placeholder="Ex: UTI, Pronto Atendimento..."
                  required
                />
              </S.InputGroup>
            </>
          )}

          <S.SubmitBtn type="submit">Cadastrar</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>

      <Footer />
    </S.PageContainer>
  );
}
