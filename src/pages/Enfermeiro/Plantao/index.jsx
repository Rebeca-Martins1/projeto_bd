import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as S from "./styles";
import Header from "../../../components/Header"; // Seu Header com o botão Voltar
import Footer from "../../../components/Footer";

// Ícones (instale com: npm install react-icons)
import { FaUserInjured, FaProcedures, FaSyringe, FaNotesMedical } from "react-icons/fa";

export default function Plantao() {
  const navigate = useNavigate();

  // --- ESTADOS DO FORMULÁRIO ---
  const [cpf, setCpf] = useState("");
  const [inicioPlantao, setInicioPlantao] = useState("");
  const [inicioFolga, setInicioFolga] = useState("");
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // --- ESTADOS DA LISTA DE PROCEDIMENTOS (BANCO DE DADOS) ---
  const [procedimentos, setProcedimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- 1. BUSCAR DADOS DO BANCO AO CARREGAR A TELA ---
  useEffect(() => {
    async function fetchProcedimentos() {
      try {
        // Altere a porta (5000) se o seu backend estiver em outra
        const response = await axios.get("http://localhost:5000/procedimentos/dia");
        
        // Sucesso: Guarda os dados do banco no estado
        setProcedimentos(response.data);
      } catch (error) {
        console.error("Erro ao buscar do banco:", error);
        // Opcional: define um estado de erro para mostrar na tela
      } finally {
        // Finaliza o loading independente se deu erro ou sucesso
        setCarregando(false);
      }
    }

    fetchProcedimentos();
  }, []); // Array vazio = executa apenas uma vez ao abrir a página

  // --- 2. ENVIAR DADOS DO PLANTÃO (FORMULÁRIO) ---
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
      setMensagem("Erro ao cadastrar plantão. Verifique os dados.");
    } finally {
      setEnviando(false);
    }
  };

  // Função auxiliar para escolher ícone baseado no tipo de procedimento (opcional)
  const getIcon = (tipo) => {
    if (tipo && tipo.toLowerCase().includes('medic')) return <FaSyringe />;
    if (tipo && tipo.toLowerCase().includes('curativo')) return <FaNotesMedical />;
    return <FaProcedures />;
  };

  return (
    <>
      <S.GlobalStyles />
      <S.ContainerPlantao>
        <Header />

        <S.MainContent>
          <div style={{ display: "flex", gap: "2rem", width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
            
            {/* --- COLUNA ESQUERDA: FORMULÁRIO --- */}
            <S.FormContainer style={{ flex: 1, minWidth: "350px", maxWidth: "500px" }}>
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

            {/* --- COLUNA DIREITA: DADOS DO BANCO --- */}
            <S.ListaContainer style={{ flex: 1, minWidth: "350px", maxWidth: "600px" }}>
              <h2>📋 Procedimentos do Dia</h2>
              <p>Pacientes aguardando atendimento no seu turno.</p>

              <div className="lista-scroll">
                
                {carregando ? (
                  <S.LoadingState>
                    <div className="spinner"></div>
                    <p>Buscando dados no sistema...</p>
                  </S.LoadingState>
                ) : procedimentos.length === 0 ? (
                  <S.EmptyState>
                    <p>Nenhum procedimento encontrado para hoje.</p>
                  </S.EmptyState>
                ) : (
                  procedimentos.map((proc) => (
                    <S.CardProcedimento key={proc.id} status={proc.status}>
                      <div className="card-header">
                        <span className="hora">⏰ {proc.hora || "--:--"}</span>
                        <span className="status-badge">{proc.status}</span>
                      </div>
                      
                      <div className="card-body">
                        <h4>{getIcon(proc.tipo)} {proc.tipo}</h4>
                        <div className="info-row">
                          <span><FaUserInjured/> <strong>Paciente:</strong> {proc.paciente}</span>
                        </div>
                        <div className="info-row">
                          <span>🛏 <strong>Leito:</strong> {proc.leito}</span>
                        </div>
                      </div>
                    </S.CardProcedimento>
                  ))
                )}

              </div>
            </S.ListaContainer>

          </div>
        </S.MainContent>

        <Footer />
      </S.ContainerPlantao>
    </>
  );
}