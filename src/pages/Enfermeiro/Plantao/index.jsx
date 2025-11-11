import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as S from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function Plantao() {
  const navigate = useNavigate();

  const [cpf, setCpf] = useState("");
  const [inicioPlantao, setInicioPlantao] = useState("");
  const [inicioFolga, setInicioFolga] = useState("");
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const calcularProximoPlantao = (dataFim) => {
    const fim = new Date(dataFim);
    if (isNaN(fim.getTime())) return null;
    const retorno = new Date(fim.getTime() + 36 * 60 * 60 * 1000);
    return retorno.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !inicioPlantao || !inicioFolga) {
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    setEnviando(true);

    try {
      const response = await axios.post("http://localhost:5000/plantao/cadastrar", {
        cpf,
        inicio_plantao: inicioPlantao,
        inicio_folga: inicioFolga,
      });

      setMensagem("Plantão cadastrado com sucesso!");
      setProximoPlantao(
        new Date(response.data.proximoPlantao).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      );

      setTimeout(() => navigate("/home-enfermeiro"), 3000);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao cadastrar plantão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <S.GlobalStyles />
      <S.ContainerPlantao>
        <Header />

        <S.MainContent>
          <S.FormContainer>
            <h1>Cadastro de Plantão</h1>
            <p>Registre seu plantão e veja quando deve retornar.</p>

            <S.Form onSubmit={handleSubmit}>
              <S.InputGroup>
                <div>
                  <label>CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Digite seu CPF"
                  />
                </div>
              </S.InputGroup>

              <S.InputGroup>
                <div>
                  <label>Início do Plantão</label>
                  <input
                    type="datetime-local"
                    value={inicioPlantao}
                    onChange={(e) => setInicioPlantao(e.target.value)}
                  />
                </div>
                <div>
                  <label>Início da Folga</label>
                  <input
                    type="datetime-local"
                    value={inicioFolga}
                    onChange={(e) => setInicioFolga(e.target.value)}
                  />
                </div>
              </S.InputGroup>

              {proximoPlantao && (
                <S.InfoBox>
                  <strong>Seu próximo plantão será em:</strong>
                  <p>{proximoPlantao}</p>
                </S.InfoBox>
              )}

              {mensagem && <S.Message>{mensagem}</S.Message>}

              <S.Button type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Cadastrar Plantão"}
              </S.Button>

              <S.Voltar onClick={() => navigate("/home-enfermeiro")}>
                ← Voltar para o Home
              </S.Voltar>
            </S.Form>
          </S.FormContainer>
        </S.MainContent>

        <Footer />
      </S.ContainerPlantao>
    </>
  );
}
