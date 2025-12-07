import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GlobalStyles,
  PageContainer,
  FormCard,
  SectionTitle,
  InputGroup,
  SubmitBtn
} from "./styles";

import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

const EditarPerilEnfermeiro = () => {
  const [isEditing, setIsEditing] = useState(true); 
  const navigate = useNavigate();

  // Dados iniciais vazios
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    sexo: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Dados do Enfermeiro salvos no BD:", formData); 
    
    alert("✅ Atualização realizada com sucesso!"); 
    setIsEditing(false); 
  };

  return (
    <>
      <Header /> {/* O header agora tem o botão VOLTAR */}
      <GlobalStyles />
      <PageContainer>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Editar Informações do Enfermeiro</h2> 
        </div>

        <FormCard onSubmit={handleSubmit}>
          <SectionTitle>Dados para serem atualizados</SectionTitle>

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
          
          {/* Botão de Submissão para salvar os dados */}
          {isEditing && <SubmitBtn type="submit">Salvar Alterações</SubmitBtn>}
        </FormCard>
      </PageContainer>
      <Footer />
    </>
  );
};

export default EditarPerilEnfermeiro;