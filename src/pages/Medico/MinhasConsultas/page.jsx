import React from "react";
import * as S from "./styles.js"; 
import Header from "../../../components/Header"; 
import Footer from "../../../components/Footer"; 

//Dados ficticios
const MOCK_CONSULTAS = [
  {
    id: 1,
    paciente: "Carlos Santana",
    data: "20/11/2025",
    horario: "09:00",
    sala: "Consultório 1A",
  },
  {
    id: 2,
    paciente: "Fernanda Lima",
    data: "20/11/2025",
    horario: "09:30",
    sala: "Consultório 1A",
  },
  {
    id: 3,
    paciente: "Ricardo Alves",
    data: "20/11/2025",
    horario: "10:00",
    sala: "Consultório 2B",
  },
  {
    id: 4,
    paciente: "Beatriz Mota",
    data: "21/11/2025",
    horario: "08:30",
    sala: "Consultório 1A",
  },
  {
    id: 5,
    paciente: "Tiago Lacerda",
    data: "21/11/2025",
    horario: "09:00",
    sala: "Consultório 3A",
  },
];

//Componente de Card para cada Consulta
function ConsultaCard({ consulta }) {
  return (
    <S.CardContainer>
      <S.CardHeader>
        <h3>{consulta.paciente}</h3>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data:</strong> {consulta.data}</p>
        <p><strong>Horário:</strong> {consulta.horario}</p>
        <p><strong>Sala:</strong> {consulta.sala}</p>
      </S.CardDetalhes>
    </S.CardContainer>
  );
}


//Componente Principal da Página
export default function MinhasConsultas() {
  return (
    <>
      <S.GlobalStyles />
      <S.MinhasConsultasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Consultas</h1>
          <p>Visualize aqui seus atendimentos agendados.</p>

          <S.ConsultaList>
            {MOCK_CONSULTAS.map((consulta) => (
              <ConsultaCard key={consulta.id} consulta={consulta} />
            ))}
          </S.ConsultaList>
        </S.MainContent>

        <Footer />
      </S.MinhasConsultasContainer>
    </>
  );
}