import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

function CirurgiaCard({ cirurgia }) {
  
  // Formatar data para ficar legível (DD/MM/AAAA HH:mm)
  const dataFormatada = new Date(cirurgia.data_hora).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <S.CardContainer>
      <S.CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h3>{cirurgia.paciente_nome}</h3>
          
          <S.StatusBadge aprovada={cirurgia.aprovada} status={cirurgia.status}>
            {cirurgia.aprovada ? "APROVADA" : "EM ANÁLISE / PENDENTE"}
          </S.StatusBadge>
        </div>
        
        <p style={{marginTop: "5px", color: "#666"}}>{cirurgia.status}</p>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data/Hora:</strong> {dataFormatada}</p>
        <p><strong>Duração Estimada:</strong> {cirurgia.duracao_minutos} min</p>
        <p><strong>Sala:</strong> {cirurgia.n_sala === 0 ? "A definir" : `Sala ${cirurgia.n_sala} (${cirurgia.tipo_sala})`}</p>
      </S.CardDetalhes>

    </S.CardContainer>
  );
}

export default function MinhasCirurgias() {
  const [cirurgias, setCirurgias] = useState([]);
  const [loading, setLoading] = useState(true);

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const cpfMedico = usuario ? usuario.cpf : "";

  useEffect(() => {
    async function carregarCirurgias() {
      if (!cpfMedico) return;

      try {
        const resp = await fetch(`http://localhost:5000/medico/${cpfMedico}/cirurgias`);
        
        if (resp.ok) {
          const dados = await resp.json();
          setCirurgias(dados);
        } else {
          console.error("Erro ao buscar cirurgias");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarCirurgias();
  }, [cpfMedico]);

  return (
    <>
      <S.GlobalStyles />
      <S.MinhasCirurgiasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Cirurgias</h1>
          <p>Acompanhe o status dos seus procedimentos cirúrgicos.</p>

          <S.CirurgiaList>
            {loading ? (
              <p>Carregando...</p>
            ) : cirurgias.length > 0 ? (
              cirurgias.map((cirurgia, index) => (
                <CirurgiaCard key={index} cirurgia={cirurgia} />
              ))
            ) : (
              <p>Nenhuma cirurgia agendada encontrada.</p>
            )}
          </S.CirurgiaList>
        </S.MainContent>

        <Footer />
      </S.MinhasCirurgiasContainer>
    </>
  );
}