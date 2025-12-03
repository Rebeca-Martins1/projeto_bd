import React, { useEffect, useState } from "react";
import { Container, Content, Table, DesativarBtn, Error, AtivarBtn } from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function DesativarLeitos() {
  const [leitos, setLeitos] = useState([]);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function carregar() {
        try {
        const req = await fetch("http://localhost:5000/desativarleitos/leitos/ativos");
        const data = await req.json();
        setLeitos(data);
        } catch {
        setErro("Erro ao carregar leitos.");
        }
    }
    carregar();
    }, []);


  async function desativarLeito(n_sala, tipo) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarleitos/leito/desativar/${n_sala}/${tipo}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setLeitos(prev =>
        prev.map(leito =>
            leito.n_sala === n_sala && leito.tipo === tipo
            ? { ...leito, ativo: false }
            : leito
        )
        );

        setSuccess("Leito desativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

    async function ativarLeito(n_sala, tipo) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarleitos/leito/ativar/${n_sala}/${tipo}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setLeitos(prev =>
        prev.map(leito =>
            leito.n_sala === n_sala && leito.tipo === tipo
            ? { ...leito, ativo: true }
            : leito
        )
        );
        
        setSuccess("Leito ativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }


  return (
    <Container>
        <Header/>
      <Content>
        <div style={{ textAlign: "center", marginBlock:"20px" }}>
        <h1>Desativar/Ativar Leitos</h1>
        {erro && <Error>{erro}</Error>}
        </div>


        <Table>
          <thead>
            <tr>
              <th>Número Sala</th>
              <th>Tipo</th>
              <th>Quantidade pacientes</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {leitos.map(leito => (
                <tr key={`${leito.n_sala}-${leito.tipo}`}>
                <td style={{ textAlign: "center" }}>{leito.n_sala}</td>
                <td style={{ textAlign: "center" }}>{leito.tipo}</td>
                <td style={{ textAlign: "center" }}>{leito.quant_paciente}</td>
                <td style={{ textAlign: "center" }}>{leito.ativo ? "Ativo" : "Desativado"}</td>
                <td style={{ textAlign: "center" }}>
                    {leito.ativo ? (
                    <DesativarBtn onClick={() => desativarLeito(leito.n_sala, leito.tipo)}>
                        Desativar
                    </DesativarBtn>
                    ) : (
                    <AtivarBtn onClick={() => ativarLeito(leito.n_sala, leito.tipo)}>
                        Ativar
                    </AtivarBtn>
                    )}
                </td>
                </tr>
            ))}
            </tbody>


        </Table>
      </Content>
      <Footer/>
    </Container>
  );
}
