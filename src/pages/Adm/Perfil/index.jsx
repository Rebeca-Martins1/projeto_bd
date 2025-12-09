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

export default function Perfil() {

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const navigate = useNavigate();

  const [dados, setDados] = useState({
    cpf: "",
    nome: "",
    telefone: "",
    email: "",
    senha: ""
  });

  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const req = await fetch(
          `http://localhost:5000/editarperfil/infoperfil/${usuario.cpf}`
        );

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
    const req = await fetch(
      `http://localhost:5000/editarperfil/editar/${usuario.cpf}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      }
    );

    if (!req.ok) {
      throw new Error("Erro ao atualizar perfil");
    }
    const usuarioAtualizado = { ...usuario, nome: dados.nome };
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => {
        navigate("/homeadm"); 
      });
    setSuccess("Perfil atualizado com sucesso!");
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
          Meu Perfil
        </h1>

        {erro && <Error>{erro}</Error>}
        {success && <Success>{success}</Success>}

        <InputGroup>
          <label>CPF (não editável)</label>
          <input type="text" value={dados.cpf} disabled />
        </InputGroup>

        <InputGroup>
          <label>Nome</label>
          <input
            type="text"
            value={dados.nome}
            onChange={(e) => setDados({ ...dados, nome: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Telefone</label>
          <input
            type="text"
            value={dados.telefone}
            onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Email</label>
          <input
            type="email"
            value={dados.email}
            onChange={(e) => setDados({ ...dados, email: e.target.value })}
          />
        </InputGroup>

        <InputGroup>
          <label>Senha</label>
          <input
            type="password"
            value={dados.senha}
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
