import React, { useState } from "react";
import {
  GlobalStyles,
  PageContainer,
  Header,
  BackButton,
  FormCard,
  SectionTitle,
  InputGroup,
  SubmitBtn
} from "./styles";

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Dados fake até conectar no backend
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

        <Header>
          <h2>Informações do Paciente</h2>

          <div style={{ display: "flex", gap: "10px" }}>
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

            <BackButton>
              Mostrar Todas as Informações
            </BackButton>
          </div>
        </Header>

        <FormCard onSubmit={handleSubmit}>
          <SectionTitle>Informações Pessoais</SectionTitle>

          <InputGroup>
            <label>Nome</label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Idade</label>
            <input
              name="idade"
              value={formData.idade}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Telefone</label>
            <input
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <SectionTitle>Histórico Clínico</SectionTitle>

          <InputGroup>
            <label>Alergias</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Cirurgias</label>
            <textarea
              name="cirurgias"
              value={formData.cirurgias}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Medicamentos</label>
            <textarea
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Cosméticos Utilizados</label>
            <textarea
              name="cosmeticos"
              value={formData.cosmeticos}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          <InputGroup>
            <label>Histórico Médico Geral</label>
            <textarea
              name="historicoMedico"
              value={formData.historicoMedico}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </InputGroup>

          {isEditing && <SubmitBtn type="submit">Salvar Alterações</SubmitBtn>}
        </FormCard>
      </PageContainer>
    </>
  );
};

export default PatientProfile;
