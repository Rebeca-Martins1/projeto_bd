import React, { useEffect, useState } from "react";
import { Container, Content, Table, DesativarBtn, Error, AtivarBtn } from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function DesativarSalas() {
  const [salas, setSalas] = useState([]);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function carregar() {
        try {
        const req = await fetch("http://localhost:5000/desativarsalas/salas/ativos");
        const data = await req.json();
        setSalas(data);
        } catch {
        setErro("Erro ao carregar salas.");
        }
    }
    carregar();
    }, []);


  async function desativarSala(n_sala, tipo) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarsalas/sala/desativar/${n_sala}/${tipo}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setSalas(prev =>
        prev.map(sala =>
            sala.n_sala === n_sala && sala.tipo === tipo
            ? { ...sala, ativo: false }
            : sala
        )
        );

        setSuccess("Sala desativada com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }

    async function ativarSala(n_sala, tipo) {
    setErro("");
    setSuccess("");

    try {
        const req = await fetch(
        `http://localhost:5000/desativarsalas/sala/ativar/${n_sala}/${tipo}`,
        {
            method: "PUT",
        }
        );

        if (!req.ok) {
        const msg = await req.text();
        setErro(msg);
        return;
        }

        setSalas(prev =>
        prev.map(sala =>
            sala.n_sala === n_sala && sala.tipo === tipo
            ? { ...sala, ativo: true }
            : sala
        )
        );
        
        setSuccess("Sala ativado com sucesso!");
    } catch (error) {
        setErro("Erro ao conectar com o servidor.");
    }
    }


  return (
    <Container>
        <Header/>
      <Content>
        <div style={{ textAlign: "center", marginBlock:"20px" }}>
        <h1>Desativar/Ativar Salas</h1>
        {erro && <Error>{erro}</Error>}
        </div>


        <Table>
          <thead>
            <tr>
              <th>Número Sala</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {salas.map(sala => (
                <tr key={`${sala.n_sala}-${sala.tipo}`}>
                <td style={{ textAlign: "center" }}>{sala.n_sala}</td>
                <td style={{ textAlign: "center" }}>{sala.tipo}</td>
                <td style={{ textAlign: "center" }}>{sala.ativo ? "Ativo" : "Desativado"}</td>
                <td style={{ textAlign: "center" }}>
                    {sala.ativo ? (
                    <DesativarBtn onClick={() => desativarSala(sala.n_sala, sala.tipo)}>
                        Desativar
                    </DesativarBtn>
                    ) : (
                    <AtivarBtn onClick={() => ativarSala(sala.n_sala, sala.tipo)}>
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
