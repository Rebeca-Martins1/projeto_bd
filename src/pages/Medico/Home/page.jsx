import React from "react";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { IconCalendarPlus, IconCalendarCheck, IconClipboardList } from "../../../icons";

function ActionCard({ icon, title, description, buttonText, path }) {
  const navigate = useNavigate();

  return (
    <S.ActionCardContainer>
      <S.ActionCardIcon>{React.createElement(icon)}</S.ActionCardIcon>
      <h3>{title}</h3>
      <p>{description}</p>
      <S.ActionCardButton 
        aria-label={title} 
        onClick={() => navigate(path)}
      >
        {buttonText}
      </S.ActionCardButton>
    </S.ActionCardContainer>
  );
}

export default function HomeMedico() {
  return (
    <>
      <S.GlobalStyles />
      <S.MedicoPortalContainer>
        <Header />

        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, [NOME DO MÉDICO]</h1>
            <p>Seu Portal Médico</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            <ActionCard 
              icon={IconCalendarPlus}
              title="AGENDAR CIRURGIA"
              description="Programe novas intervenções com o médico"
              buttonText="IR PRA SESSÃO"
              path="/medico/agendar-cirurgia"
            />
            <ActionCard 
              icon={IconCalendarCheck}
              title="MINHAS CIRURGIAS"
              description="Visualize suas cirurgias agendadas e passadas"
              buttonText="IR PRA SESSÃO"
              path="/medico/minhas-cirurgias"
            />
            <ActionCard 
              icon={IconClipboardList}
              title="MINHAS CONSULTAS"
              description="Veja seus atendimentos e horários"
              buttonText="IR PRA SESSÃO"
              path="/medico/minhas-consultas"
            />
          </S.CardGrid>
        </S.MainContent>

        <Footer />
      </S.MedicoPortalContainer>
    </>
  );
}
