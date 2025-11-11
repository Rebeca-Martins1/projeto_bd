import React, { useState } from "react";
import * as S from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function Plantao() {
  const [cpf, setCpf] = useState("");
  const [coren, setCoren] = useState("");
  const [inicioPlantao, setInicioPlantao] = useState("");
  const [inicioFolga, setInicioFolga] = useState("");
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const calcularProximoPlantao = (dataFim) => {
    const fim = new Date(dataFim);
    if (isNaN(fim.getTime())) return null;

    const retorno = new Date(fim.getTime() + 36 * 60 * 60 * 1000);
    return retorno.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !coren || !inicioPlantao || !inicioFolga) {
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    const dataRetorno = calcularProximoPlantao(inicioFolga);
    setProximoPlantao(dataRetorno);

    // Simulação de envio ao backend
    const payload = {
      cpf,
      coren,
      inicio_plantao: inicioPlantao,
      inicio_folga: inicioFolga,
      disponivel: false,
    };

    try {
      // Exemplo de POST (descomente se for usar axios)
      // await axios.post("http://seu-backend.com/api/plantao", payload);
      setMensagem("Plantão cadastrado com sucesso!");
    } catch (error) {
      setMensagem("Erro ao cadastrar plantão. Tente novamente.");
    }
  };

  return (
    <>
      <S.GlobalStyles />
      <S.PageContainer>
        <Header />

        <S.FormContainer>
          <S.FormBox onSubmit={handleSubmit}>
            <h2>Cadastro de Plantão</h2>
            <p>Preencha as informações abaixo</p>

            <S.FormGrid>
              <S.InputGroup>
                <label>CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Digite o CPF"
                  required
                />
              </S.InputGroup>

              <S.InputGroup>
                <label>COREN</label>
                <input
                  type="text"
                  value={coren}
                  onChange={(e) => setCoren(e.target.value)}
                  placeholder="Digite o COREN"
                  required
                />
              </S.InputGroup>

              <S.InputGroup>
                <label>Início do Plantão</label>
                <input
                  type="datetime-local"
                  value={inicioPlantao}
                  onChange={(e) => setInicioPlantao(e.target.value)}
                  required
                />
              </S.InputGroup>

              <S.InputGroup>
                <label>Fim do Plantão (Início da Folga)</label>
                <input
                  type="datetime-local"
                  value={inicioFolga}
                  onChange={(e) => setInicioFolga(e.target.value)}
                  required
                />
              </S.InputGroup>
            </S.FormGrid>

            <S.SubmitButton type="submit">Cadastrar Plantão</S.SubmitButton>

            {proximoPlantao && (
              <S.Resultado>
                <strong>Seu próximo plantão será em:</strong>
                <span>{proximoPlantao}</span>
              </S.Resultado>
            )}

            {mensagem && <S.Mensagem>{mensagem}</S.Mensagem>}
          </S.FormBox>
        </S.FormContainer>

        <Footer />
      </S.PageContainer>
    </>
  );
}
