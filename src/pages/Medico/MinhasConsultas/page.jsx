import React, { useState, useEffect } from "react"; 
import * as S from "./styles.js"; 
import Header from "../../../components/Header"; 
import Footer from "../../../components/Footer"; 

function ConsultaCard({ consulta }) {
  return (
    <S.CardContainer>
      <S.CardHeader>
        <h3>{consulta.paciente}</h3>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data/Hora:</strong> {new Date(consulta.data_hora).toLocaleString()}</p>
        <p><strong>Tipo:</strong> {consulta.tipo_consulta}</p>
        <p><strong>Sala:</strong> {consulta.n_sala} - {consulta.tipo_sala}</p>
        <p><strong>Obs:</strong> {consulta.observacoes}</p>
      </S.CardDetalhes>
    </S.CardContainer>
  );
}

export default function MinhasConsultas() {
  const [consultas, setConsultas] = useState([]); 

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const cpfDoMedico = usuario ? usuario.cpf : "";

  useEffect(() => {
    async function carregar() {
      if (!cpfDoMedico) return;
      try {
        const resp = await fetch(`http://localhost:5000/medico/${cpfDoMedico}/consultas`);
        
        if (!resp.ok) {
           console.error("Erro ao buscar dados");
           return;
        }

        const dados = await resp.json();
        setConsultas(dados);
      } catch (error) {
        console.error("Erro de conexão:", error);
      }
    }

    carregar();
  }, []);

  return (
    <>
      <S.GlobalStyles />
      <S.MinhasConsultasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Consultas</h1>
          <p>Visualize aqui seus atendimentos agendados.</p>

          <S.ConsultaList>
            {consultas.length > 0 ? (
              consultas.map((consulta, index) => (
                <ConsultaCard key={index} consulta={consulta} />
              ))
            ) : (
              <p>Nenhuma consulta encontrada ou carregando...</p>
            )}
          </S.ConsultaList>
        </S.MainContent>

        <Footer />
      </S.MinhasConsultasContainer>
    </>
  );
}