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

const EditarPerfil = () => {
  const [isEditing, setIsEditing] = useState(true); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    sexo: "" // Começa sem opção selecionada
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Mantive a função de toggle caso seja usada no futuro para visualizar/editar
  const handleToggleEdit = () => setIsEditing(!isEditing);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Apenas loga os dados (simulação de envio para o banco de dados)
    console.log("Dados a serem salvos:", formData);
  

    alert("Cadastro realizado com sucesso!");
    setIsEditing(false); // Desativa a edição após o envio
  };

  return (
    <>
      <GlobalStyles />
      <PageContainer>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Cadastro do Enfermeiro</h2> 

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px"
            }}
          >
            {/* Mantido o botão Editar/Cancelar, mas ajustando o fluxo para cadastro, onde a edição é o padrão */}
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
              {isEditing ? "Cancelar Preenchimento" : "Habilitar Edição"}
            </button>

            <BackButton
              onClick={() => navigate("/home")}
              style={{ backgroundColor: "#8d99ae", color: "#1c2541" }}
            >
              Voltar
            </BackButton>
          </div>
        </div>

        <FormCard onSubmit={handleSubmit}>
          <SectionTitle>Dados de Cadastro</SectionTitle>

          {[
            ["nome", "Nome do Enfermeiro"],
            ["telefone", "Telefone"],
            ["email", "Email"]
          ].map(([field, label]) => (
            <InputGroup key={field}>
              <label>{label}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                // Como é um cadastro, ele estará SEMPRE habilitado ou habilitado se isEditing for true
                disabled={!isEditing} 
                placeholder={`Digite o ${label.toLowerCase()}`}
              />
            </InputGroup>
          ))}

          {/* Campo Sexo (Select) */}
          <InputGroup>
            <label>Sexo</label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="" disabled>Selecione o Sexo</option> {/* Opção vazia */}
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
              <option value="Prefiro não informar">Prefiro não informar</option>
            </select>
          </InputGroup>

          {isEditing && <SubmitBtn type="submit">Cadastrar Enfermeiro</SubmitBtn>}
        </FormCard>
      </PageContainer>
    </>
  );
};

export default EditarPerfil;