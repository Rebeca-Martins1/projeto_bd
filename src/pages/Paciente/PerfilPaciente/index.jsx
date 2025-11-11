import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GlobalStyles,
  PageContainer,
  BackButton,
  FormCard,
  SectionTitle,
  InputGroup,
  SubmitBtn
} from "./styles";

import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "Maria Santos",
    idade: "32",
    telefone: "(11) 99822-3344",
    email: "maria.santos@example.com",
    alergias: "Alergia a Dipirona",
    cirurgias: "Rinoplastia (2020)",
    medicamentos: "Anticoncepcional contínuo",
    cosmeticos: "Vitamina C, Niacinamida, Ácido Hialurônico",
    historicoMedico: "Dermatite leve, tratada com hidratante específico"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = () => setIsEditing(!isEditing);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Dados atualizados (simulação)!");
    setIsEditing(false);
  };

  return (
    <>
      <GlobalStyles />
      <PageContainer>
        {/* ✅ Cabeçalho (componente pronto) */}
        <Header />

        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Informações do Paciente</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px"
            }}
          >
            <button
              onClick={handleToggleEdit}
              style={{
                background: "#1c2541",
                color: "#fff",
                border: "none",
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>

            <BackButton onClick={() => navigate("/portalpaciente")}>
              Mostrar Todas as Informações
            </BackButton>
          </div>
        </div>

        <FormCard onSubmit={handleSubmit}>
          <SectionTitle>Informações Pessoais</SectionTitle>

          {[
            ["nome", "Nome"],
            ["idade", "Idade"],
            ["telefone", "Telefone"],
            ["email", "Email"]
          ].map(([field, label]) => (
            <InputGroup key={field}>
              <label>{label}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </InputGroup>
          ))}

          <SectionTitle>Histórico Clínico</SectionTitle>

          {[
            ["alergias", "Alergias"],
            ["cirurgias", "Cirurgias"],
            ["medicamentos", "Medicamentos"],
            ["cosmeticos", "Cosméticos Utilizados"],
            ["historicoMedico", "Histórico Médico Geral"]
          ].map(([field, label]) => (
            <InputGroup key={field}>
              <label>{label}</label>
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </InputGroup>
          ))}

          {isEditing && <SubmitBtn type="submit">Salvar Alterações</SubmitBtn>}
        </FormCard>

        {/* ✅ Rodapé (componente pronto) */}
        <Footer />
      </PageContainer>
    </>
  );
};

export default PatientProfile;
