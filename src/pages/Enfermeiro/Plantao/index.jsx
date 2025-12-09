import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as S from "./styles";
import Header from "../../../components/Header"; // Seu Header com o botão Voltar
import Footer from "../../../components/Footer";

// Ícones
// import { FaUserInjured, FaProcedures, FaSyringe, FaNotesMedical } from "react-icons/fa"; // Ícones de procedimento removidos

export default function Plantao() {
  const navigate = useNavigate();

  // --- ESTADOS DO FORMULÁRIO ---
  // CPF será usado para identificar o enfermeiro a ser atualizado no backend
  const [cpf, setCpf] = useState(""); 
  const [inicioPlantao, setInicioPlantao] = useState("");
  const [inicioFolga, setInicioFolga] = useState("");
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // --- REMOVIDO: ESTADOS E LÓGICA DE PROCEDIMENTOS (useEffect) ---
  // Não precisamos mais de `procedimentos`, `carregando` ou `useEffect` para buscar a lista.

  // --- 1. ENVIAR DADOS DO PLANTÃO (FORMULÁRIO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !inicioPlantao || !inicioFolga) {
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    setEnviando(true);

    try {
      // A rota POST /plantao/cadastrar é mantida
      const response = await axios.post("http://localhost:5000/plantao/cadastrar", {
        cpf,
        inicio_plantao: inicioPlantao,
        inicio_folga: inicioFolga,
      });

      setMensagem("Plantão registrado com sucesso!");
      
      // Formata a data de retorno vinda do backend
      if (response.data.proximoPlantao) {
        setProximoPlantao(
          new Date(response.data.proximoPlantao).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })
        );
      }

      // Redireciona após 3 segundos
      setTimeout(() => navigate("/homeenfermeiro"), 3000);
      
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao registrar plantão. Verifique os dados.");
    } finally {
      setEnviando(false);
    }
  };

  // --- REMOVIDO: Função auxiliar getIcon ---

  return (
    <>
      {/* ATENÇÃO: Se o seu styles.js usava GlobalStyles, certifique-se de que ele foi importado no main.jsx ou remova S.GlobalStyles se não for necessário */}
      <S.ContainerPlantao>
        <Header />

        <S.MainContent>
          {/* MANTEMOS APENAS A COLUNA DO FORMULÁRIO CENTRALIZADA */}
          <S.FormContainer style={{ 
            flex: 1, 
            minWidth: "350px", 
            maxWidth: "500px",
            // CENTRALIZAÇÃO: Adiciona margem lateral automática para centralizar
            margin: "0 auto" 
          }}>
            
            <h1>Registrar Ponto</h1>
            <p>Informe seus horários para cálculo de folga.</p>

            <S.Form onSubmit={handleSubmit}>
              <S.InputGroup>
                <div>
                  <label>CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </S.InputGroup>

              <S.InputGroup>
                <div>
                  <label>Início Plantão</label>
                  <input
                    type="datetime-local"
                    value={inicioPlantao}
                    onChange={(e) => setInicioPlantao(e.target.value)}
                  />
                </div>
                <div>
                  <label>Início Folga</label>
                  <input
                    type="datetime-local"
                    value={inicioFolga}
                    onChange={(e) => setInicioFolga(e.target.value)}
                  />
                </div>
              </S.InputGroup>

              {proximoPlantao && (
                <S.InfoBox>
                  <strong>Seu retorno será em:</strong>
                  <p>{proximoPlantao}</p>
                </S.InfoBox>
              )}

              {mensagem && <S.Message error={mensagem.includes("Erro")}>{mensagem}</S.Message>}

              <S.Button type="submit" disabled={enviando}>
                {enviando ? "Registrando..." : "Confirmar Plantão"}
              </S.Button>
            </S.Form>
          </S.FormContainer>

          {/* --- REMOVIDO: COLUNA DIREITA (Lista de Procedimentos) --- */}

        </S.MainContent>

        <Footer />
      </S.ContainerPlantao>
    </>
  );
}