import React, { useEffect, useState } from "react";
import {
  Container,
  Content,
  Error,
  Success,
  EditBtn,
  InputGroup
} from "./styles"; 
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function PerfilEnfermeiro() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const navigate = useNavigate();

  // Estado inicial com COREN em vez de CRM
  const [dados, setDados] = useState({
    cpf: "",
    nome: "",
    telefone: "",
    email: "",
    senha: "",
    coren: "" 
  });

  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      if (!usuario || !usuario.cpf) return;

      try {
        // Rota ajustada para o backend do enfermeiro
        const req = await fetch(`http://localhost:5000/enfermeiro/${usuario.cpf}/perfil`);

        if (!req.ok) {
          throw new Error("Erro ao buscar perfil");
        }

        const data = await req.json();
        setDados(data);
      } catch (error) {
        console.error("ERRO NO FETCH:", error);
        setErro("Erro ao carregar dados do servidor.");
      }
    }

    carregarPerfil();
  }, []); 

  async function salvarAlteracoes() {
    setErro("");
    setSuccess("");

    try {
      // Envia as alterações para o backend
      const req = await fetch(
        `http://localhost:5000/enfermeiro/${usuario.cpf}/perfil`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        }
      );

      if (!req.ok) {
        throw new Error("Erro ao atualizar perfil");
      }

      // Atualiza o localStorage para refletir mudança de nome no header imediatamente
      const usuarioAtualizado = { ...usuario, nome: dados.nome };
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

      setSuccess("Perfil atualizado com sucesso!");
      
      // Redireciona para a Home do Enfermeiro
      setTimeout(() => {
        navigate("/homeenfermeiro"); 
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setErro("Erro ao salvar alterações.");
    }
  }

  return (
    <Container>
      <Header />
      
      <Content>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Perfil do Enfermeiro
        </h1>

        {erro && <Error>{erro}</Error>}
        {success && <Success>{success}</Success>}

        {/* Linha com CPF e COREN (Campos desabilitados) */}
        <div style={{ display: "flex", gap: "20px" }}>
            <InputGroup style={{ flex: 1 }}>
                <label>CPF</label>
                <input 
                    type="text" 
                    value={dados.cpf || ""} 
                    disabled 
                    style={{ backgroundColor: "#e9ecef" }} 
                />
            </InputGroup>

            <InputGroup style={{ flex: 1 }}>
                <label>COREN</label>
                <input 
                    type="text" 
                    value={dados.coren || ""} 
                    disabled 
                    style={{ backgroundColor: "#e9ecef" }} 
                />
            </InputGroup>
        </div>

        <InputGroup>
          <label>Nome Completo</label>
          <input
            type="text"
            value={dados.nome || ""}
            onChange={(e) => setDados({ ...dados, nome: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Telefone</label>
          <input
            type="text"
            value={dados.telefone || ""}
            onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Email</label>
          <input
            type="email"
            value={dados.email || ""}
            onChange={(e) => setDados({ ...dados, email: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Senha</label>
          <input
            type="text" 
            value={dados.senha || ""}
            onChange={(e) => setDados({ ...dados, senha: e.target.value })}
          />
        </InputGroup>

        <EditBtn onClick={salvarAlteracoes}>
          Salvar Alterações
        </EditBtn>
      </Content>

      <Footer />
    </Container>
  );
}