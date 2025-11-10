import React from "react";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

import { IconCalendarPlus, IconCalendarCheck, IconClipboardList } from "../../../icons";

function ActionCard({ icon, title, description, buttonText }) {
  return (
    <S.ActionCardContainer>
      <S.ActionCardIcon>{React.createElement(icon)}</S.ActionCardIcon>
      <h3>{title}</h3>
      <p>{description}</p>
      <S.ActionCardButton>{buttonText}</S.ActionCardButton>
    </S.ActionCardContainer>
  );
}

export default function HomeEnfermeiro() {
  return (
    <>
      <S.GlobalStyles />
      <S.EnfermeiroPortalContainer>
        <Header />

        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, [NOME DO ENFERMEIRO]</h1>
            <p>Portal do Enfermeiro</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            <ActionCard 
              icon={IconCalendarPlus}
              title="EDITAR PERFIL"
              description="Atualize suas informações"
              buttonText="IR PRA SEÇÃO"
            />
            <ActionCard 
              icon={IconCalendarCheck}
              title="MINHAS CIRURGIAS"
              description="Visualize suas cirurgias agendadas e passadas"
              buttonText="IR PRA SEÇÃO"
            />
            <ActionCard 
              icon={IconClipboardList}
              title="LEITOS SOB MINHA RESPONSABILIDADE"
              description="Veja suas ocupações e os detalhes dos leitos"
              buttonText="IR PRA SEÇÃO"
            />
          </S.CardGrid>
        </S.MainContent>

        <Footer />
      </S.EnfermeiroPortalContainer>
    </>
  );
}
