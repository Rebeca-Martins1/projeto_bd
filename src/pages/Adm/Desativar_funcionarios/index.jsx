import React, { useEffect, useState } from "react";
import { Container, Content, Table, DesativarBtn, Error, AtivarBtn } from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function DesativarPessoas() {
  const [medicos, setMedicos] = useState([]);
  const [enfermeiros, setEnfermeiros] = useState([]);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const reqMedicos = await fetch("http://localhost:5000/desativarfuncionarios/listarMedicos");
        const medicosData = await reqMedicos.json();

        const reqEnf = await fetch("http://localhost:5000/desativarfuncionarios/listarEnfermeiros");
        const enfData = await reqEnf.json();

        setMedicos(medicosData);
        setEnfermeiros(enfData);
      } catch {
        setErro("Erro ao carregar funcionarios.");
      }
    }
    carregar();
  }, []);

  async function desativarMedico(cpf) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarfuncionarios/medico/desativar/${cpf}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setMedicos(prev =>
        prev.map(medico =>
            medico.cpf === cpf
            ? { ...medico, ativo: false }
            : medico
        )
        );

        setSuccess("Medico desativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

    async function desativarEnfermeiro(cpf) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarfuncionarios/enfermeiro/desativar/${cpf}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setEnfermeiros(prev =>
        prev.map(enfermeiro =>
            enfermeiro.cpf === cpf
            ? { ...enfermeiro, ativo: false }
            : enfermeiro
        )
        );

        setSuccess("Enfermeiro desativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

    async function ativarMedico(cpf) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarfuncionarios/medico/ativar/${cpf}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setMedicos(prev =>
        prev.map(medico =>
            medico.cpf === cpf
            ? { ...medico, ativo: true }
            : medico
        )
        );
        
        setSuccess("Medico ativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

    async function ativarEnfermeiro(cpf) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarfuncionarios/enfermeiro/ativar/${cpf}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setEnfermeiros(prev =>
        prev.map(enfermeiro =>
            enfermeiro.cpf === cpf
            ? { ...enfermeiro, ativo: true }
            : enfermeiro
        )
        );
        
        setSuccess("Enfermeiro ativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

  return (
    <Container>
      <Header />
      <Content>
        <div style={{ textAlign: "center", marginBlock: "20px" }}>
          <h1>Gerenciar Médicos e Enfermeiros</h1>
          {erro && <Error>{erro}</Error>}
        </div>

        <h2 style={{ marginTop: "20px" }}>Médicos</h2>
        <Table>
          <thead>
            <tr>
              <th>CPF</th>
              <th>Nome</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {medicos.map(m => (
              <tr key={m.cpf}>
                <td style={{ textAlign: "center" }}>{m.cpf}</td>
                <td style={{ textAlign: "center" }}>{m.nome}</td>
                <td style={{ textAlign: "center" }}>{m.ativo ? "Ativo" : "Desativado"}</td>
                <td style={{ textAlign: "center" }}>
                  {m.ativo ? (
                    <DesativarBtn onClick={() => desativarMedico( m.cpf, "desativar")}>
                      Desativar
                    </DesativarBtn>
                  ) : (
                    <AtivarBtn onClick={() => ativarMedico( m.cpf, "ativar")}>
                      Ativar
                    </AtivarBtn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h2 style={{ marginTop: "20px" }}>Enfermeiros</h2>
        <Table>
          <thead>
            <tr>
              <th>CPF</th>
              <th>Nome</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {enfermeiros.map(e => (
              <tr key={e.cpf}>
                <td style={{ textAlign: "center" }}>{e.cpf}</td>
                <td style={{ textAlign: "center" }}>{e.nome}</td>
                <td style={{ textAlign: "center" }}>{e.ativo ? "Ativo" : "Desativado"}</td>
                <td style={{ textAlign: "center" }}>
                  {e.ativo ? (
                    <DesativarBtn onClick={() => desativarEnfermeiro(e.cpf, "desativar")}>
                      Desativar
                    </DesativarBtn>
                  ) : (
                    <AtivarBtn onClick={() => ativarEnfermeiro(e.cpf, "ativar")}>
                      Ativar
                    </AtivarBtn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
      <Footer />
    </Container>
  );
}
