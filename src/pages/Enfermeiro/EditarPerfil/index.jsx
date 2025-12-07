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

// Mantendo Header e Footer do modelo original, caso você precise deles na estrutura
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

// O nome do componente foi mudado de PatientProfile para EditarPerilEnfermeiro
const EditarPerilEnfermeiro = () => {
  // Configurado como 'true' por padrão para que o formulário esteja pronto para preenchimento
  const [isEditing, setIsEditing] = useState(true); 
  const navigate = useNavigate();

  // Dados iniciais (vazios), focados nas especificações do Enfermeiro
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    sexo: "" // Inicializado vazio para forçar a seleção
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = () => setIsEditing(!isEditing);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulação de envio para o Banco de Dados (sem alert() de sucesso)
    console.log("Enviando dados do Enfermeiro para o BD:", formData); 
    
    alert("✅ Cadastro realizado com sucesso!"); 
    setIsEditing(false); // Desativa a edição após o cadastro
  };

  return (
    <>
      <Header />
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

            {/* Mantendo o estilo do botão Voltar do modelo original, mas ajustando a rota */}
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
              <option value="" disabled>Selecione o Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
              <option value="Prefiro não informar">Prefiro não informar</option>
            </select>
          </InputGroup>

          {/* Os campos de Histórico Clínico foram removidos */}
          
          {isEditing && <SubmitBtn type="submit">Cadastrar Enfermeiro</SubmitBtn>}
        </FormCard>
      </PageContainer>
      <Footer />
    </>
  );
};

export default EditarPerilEnfermeiro;