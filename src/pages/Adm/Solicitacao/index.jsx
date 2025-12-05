import React, { useEffect, useState } from "react";
import { Container, Content, Table, Error, AtivarBtn, DesativarBtn } from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function AceitarCirurgia() {
  const [cirurgias, setCirurgias] = useState([]);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar cirurgias pendentes
  useEffect(() => {
    async function carregar() {
      try {
        const req = await fetch("http://localhost:5000/solicitacaocirurgia/cirurgias");
        const data = await req.json();
        setCirurgias(data);
      } catch (err) {
        setErro("Erro ao carregar solicitações de cirurgia.");
      }
    }
    carregar();
  }, []);

  // --------- APROVAR ----------
  async function aprovar(cpf, dataHora) {
    setErro("");
    setSuccess("");

    try {
      const req = await fetch(
        `http://localhost:5000/solicitacaocirurgia/cirurgias/aprovar/${cpf}/${encodeURIComponent(
          dataHora
        )}`,
        { method: "PUT" }
      );

      if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
      }

      // Remove da lista
      setCirurgias(prev => prev.filter(c => !(c.cpf_paciente === cpf && c.data_hora === dataHora)));

      setSuccess("Cirurgia aprovada com sucesso!");
    } catch {
      setErro("Erro ao conectar ao servidor.");
    }
  }

  async function rejeitar(cpf, dataHora) {
    setErro("");
    setSuccess("");

    try {
      const req = await fetch(
        `http://localhost:5000/solicitacaocirurgia/cirurgias/desaprovar/${cpf}/${encodeURIComponent(
          dataHora
        )}`,
        { method: "PUT" }
      );

      if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
      }

      // Remove da lista
      setCirurgias(prev => prev.filter(c => !(c.cpf_paciente === cpf && c.data_hora === dataHora)));

      setSuccess("Cirurgia rejeitada.");
    } catch {
      setErro("Erro ao conectar ao servidor.");
    }
  }

  return (
    <Container>
      <Header />

      <Content>
        <div style={{ textAlign: "center", marginBlock: "20px" }}>
          <h1>Solicitações de Cirurgia</h1>
          {erro && <Error>{erro}</Error>}
          {success && <p style={{ color: "green" }}>{success}</p>}
        </div>

        <Table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>CPF</th>
              <th>Data/Hora</th>
              <th>Sala</th>
              <th>Duração</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {cirurgias.map((c, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: "center" }}>{c.nome_paciente}</td>
                <td style={{ textAlign: "center" }}>{c.cpf_paciente}</td>
                <td style={{ textAlign: "center" }}>{c.data_hora}</td>
                <td style={{ textAlign: "center" }}>{c.n_sala} - {c.tipo_sala}</td>
                <td style={{ textAlign: "center" }}>{c.duracao_minutos} min</td>

                <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <AtivarBtn onClick={() => aprovar(c.cpf_paciente, c.data_hora)}>
                    Aceitar
                  </AtivarBtn>

                  <DesativarBtn onClick={() => rejeitar(c.cpf_paciente, c.data_hora)}>
                    Recusar
                  </DesativarBtn>
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
