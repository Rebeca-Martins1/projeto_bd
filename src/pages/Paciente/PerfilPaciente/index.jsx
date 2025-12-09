import React, { useState, useEffect } from "react";
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

// URL base da sua API
const API_URL = "http://localhost:5000";

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Pega o CPF do usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const cpfPaciente = usuarioLogado ? usuarioLogado.cpf : null;

  const [formData, setFormData] = useState({
    nome: "",
    idade: "", 
    telefone: "",
    email: "",
    alergias: "",
    medicamentos: "",
    historicoMedico: "",
    // Campos Extras do DB
    data_nascimento: "",
    R_telefone: "",
    R_cpf: "",
    empresa_plano: "",
    numero_carteirinha: ""
    // REMOVIDO: cosmeticos
  });

  // --- BUSCAR DADOS (GET) ---
  useEffect(() => {
    async function carregarDados() {
      if (!cpfPaciente) return;
      try {
        const resp = await fetch(`${API_URL}/paciente/${cpfPaciente}/perfil`);
        if (resp.ok) {
          const dadosDB = await resp.json();
          
          // Calcular Idade
          let idadeCalc = "";
          if (dadosDB.data_nascimento) {
            const nasc = new Date(dadosDB.data_nascimento);
            const hoje = new Date();
            idadeCalc = hoje.getFullYear() - nasc.getFullYear();
          }

          // Atualizar estado com dados do banco
          setFormData(prev => ({
            ...prev,
            nome: dadosDB.nome || "",
            email: dadosDB.email || "",
            telefone: dadosDB.telefone || "",
            data_nascimento: dadosDB.data_nascimento ? dadosDB.data_nascimento.split('T')[0] : "",
            idade: idadeCalc,
            // Tabelas extras
            alergias: dadosDB.alergias || "",
            medicamentos: dadosDB.medicamentos || "",
            historicoMedico: dadosDB.historico_medico || "", 
            // Campos específicos de paciente
            R_telefone: dadosDB.R_telefone || "",
            R_cpf: dadosDB.R_cpf || "",
            empresa_plano: dadosDB.empresa_plano || "",
            numero_carteirinha: dadosDB.numero_carteirinha || ""
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [cpfPaciente]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // --- SALVAR DADOS (PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cpfPaciente) return;

    try {
      const resp = await fetch(`${API_URL}/paciente/${cpfPaciente}/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (resp.ok) {
        alert("Dados atualizados com sucesso!");
        setIsEditing(false);
      } else {
        alert("Erro ao atualizar perfil.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro de conexão.");
    }
  };

  if (loading) return <p style={{padding: 20}}>Carregando perfil...</p>;

  return (
    <>
      <Header />
      <GlobalStyles />
      <PageContainer>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Informações do Paciente</h2>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={handleToggleEdit}
              style={{
                background: "#1c2541", color: "#fff", border: "none",
                padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
              }}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
          </div>
        </div>

        <FormCard onSubmit={handleSubmit}>
          <SectionTitle>Informações Pessoais</SectionTitle>

          <InputGroup>
            <label>Nome</label>
            <input name="nome" value={formData.nome} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>
          
          <InputGroup>
             <label>Data de Nascimento</label>
             <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>

          <InputGroup>
            <label>Idade (Calculada)</label>
            <input name="idade" value={formData.idade} disabled={true} style={{backgroundColor: '#f0f0f0'}} />
          </InputGroup>

          <InputGroup>
            <label>Telefone</label>
            <input name="telefone" value={formData.telefone} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>

          <InputGroup>
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>

          <SectionTitle>Detalhes do Plano & Emergência</SectionTitle>

          <InputGroup>
            <label>Plano de Saúde</label>
            <input name="empresa_plano" value={formData.empresa_plano} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>
          <InputGroup>
            <label>Número Carteirinha</label>
            <input name="numero_carteirinha" value={formData.numero_carteirinha} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>
           <InputGroup>
            <label>Telefone Responsável</label>
            <input name="R_telefone" value={formData.R_telefone} onChange={handleChange} disabled={!isEditing} />
          </InputGroup>

          <SectionTitle>Histórico Clínico (Separe por vírgulas)</SectionTitle>

          {[
            ["alergias", "Alergias"],
            ["medicamentos", "Medicamentos"],
            ["historicoMedico", "Doenças / Histórico"],
            // REMOVIDO: O array de cosméticos que estava aqui
          ].map(([field, label]) => (
            <InputGroup key={field}>
              <label>{label}</label>
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Ex: Item 1, Item 2, Item 3"
              />
            </InputGroup>
          ))}

          {isEditing && <SubmitBtn type="submit">Salvar Alterações</SubmitBtn>}
        </FormCard>
      </PageContainer>
      <Footer />
    </>
  );
};

export default PatientProfile;