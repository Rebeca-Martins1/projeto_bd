import React from "react";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { FaUserCog } from "react-icons/fa"; 
import { IconCalendarPlus, IconCalendarCheck, IconClipboardList } from "../../../icons";

function ActionCard({ icon, title, description, buttonText, path }) {
  const navigate = useNavigate();

  return (
    <S.ActionCardContainer>
      <S.ActionCardIcon>{React.createElement(icon, { size: 40 })}</S.ActionCardIcon>
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
  
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  return (
    <>
      <S.GlobalStyles />
      <S.MedicoPortalContainer>
        <Header />

        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, {usuario?.nome || "Doutor(a)"}</h1>
            <p>Seu Portal Médico</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            <ActionCard 
              icon={IconCalendarPlus}
              title="AGENDAR CIRURGIA"
              description="Agende aqui suas próximas cirurgias"
              buttonText="IR PRA SESSÃO"
              path="/agendarcirurgia"
            />
            <ActionCard 
              icon={IconCalendarCheck}
              title="MINHAS CIRURGIAS"
              description="Visualize suas cirurgias agendadas"
              buttonText="IR PRA SESSÃO"
              path="/minhascirurgias"
            />
            <ActionCard 
              icon={IconClipboardList}
              title="MINHAS CONSULTAS"
              description="Veja seus atendimentos e horários"
              buttonText="IR PRA SESSÃO"
              path="/minhasconsultas"
            />
            <ActionCard 
              icon={FaUserCog}
              title="EDITAR PERFIL"
              description="Atualize seus dados cadastrais e senha"
              buttonText="IR PRA SESSÃO"
              path="/perfilmedico"
            />
            
          </S.CardGrid>
        </S.MainContent>

        <Footer />
      </S.MedicoPortalContainer>
    </>
  );
}