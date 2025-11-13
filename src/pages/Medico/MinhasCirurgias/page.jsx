import React from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

//Dados ficticios
const MOCK_CIRURGIAS = [
  {
    id: 1,
    paciente: "Ana Silva",
    procedimento: "Apendicectomia",
    data: "20/11/2025",
    horario: "08:00",
    sala: "Sala 01",
    equipe: ["Dr. Carlos (Anestesista)", "Enf. Beatriz", "Enf. Roberto"]
  },
  {
    id: 2,
    paciente: "Marcos Rocha",
    procedimento: "Artroplastia de Quadril",
    data: "22/11/2025",
    horario: "10:30",
    sala: "Sala 03",
    equipe: ["Dr. Mendes (Anestesista)", "Enf. Clara", "Enf. Tiago"]
  },
  {
    id: 3,
    paciente: "Juliana Costa",
    procedimento: "Colecistectomia",
    data: "25/11/2025",
    horario: "14:00",
    sala: "Sala 02",
    equipe: ["Dr. Carlos (Anestesista)", "Enf. Beatriz", "Enf. Sofia"]
  },
];

//Componente de Card para cada Cirurgia
function CirurgiaCard({ cirurgia }) {
  return (
    <S.CardContainer>
      <S.CardHeader>
        <h3>{cirurgia.paciente}</h3>
        <p>{cirurgia.procedimento}</p>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data:</strong> {cirurgia.data}</p>
        <p><strong>Horário:</strong> {cirurgia.horario}</p>
        <p><strong>Sala:</strong> {cirurgia.sala}</p>
      </S.CardDetalhes>

      <S.TeamSection>
        <strong>Equipe de Apoio:</strong>
        <S.TeamList>
          {cirurgia.equipe.map((membro, index) => (
            <S.TeamMember key={index}>{membro}</S.TeamMember>
          ))}
        </S.TeamList>
      </S.TeamSection>
    </S.CardContainer>
  );
}


//Componente Principal da Página
export default function MinhasCirurgias() {
  return (
    <>
      <S.GlobalStyles />
      <S.MinhasCirurgiasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Cirurgias</h1>
          <p>Visualize aqui seus procedimentos agendados.</p>

          <S.CirurgiaList>
            {MOCK_CIRURGIAS.map((cirurgia) => (
              <CirurgiaCard key={cirurgia.id} cirurgia={cirurgia} />
            ))}
          </S.CirurgiaList>
        </S.MainContent>

        <Footer />
      </S.MinhasCirurgiasContainer>
    </>
  );
}