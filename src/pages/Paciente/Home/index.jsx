import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

// Importando os ícones no mesmo estilo do Médico
import { FaUserCog } from "react-icons/fa"; 
import { IconCalendarPlus, IconCalendarCheck, IconClipboardList } from "../../../icons";

// Componente de Card padronizado (Igual ao do Médico)
function ActionCard({ icon, title, description, buttonText, path }) {
  const navigate = useNavigate();

  return (
    <S.ActionCardContainer>
      {/* React.createElement permite renderizar tanto ícones do react-icons quanto os personalizados */}
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

export default function HomePaciente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("usuarioLogado");
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!usuario) {
    return <p style={{padding: "20px"}}>Carregando...</p>;
  }

  return (
    <>
      <S.GlobalStyles />
      <S.PacientePortalContainer>
        <Header />

        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, {usuario.nome}</h1>
            <p>Seu Portal do Paciente</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            
            {/* 1. AGENDAR CONSULTA */}
            <ActionCard 
              icon={IconCalendarPlus}
              title="MARCAR CONSULTA"
              description="Agende um novo atendimento"
              buttonText="IR PRA SEÇÃO"
              path="/MarcarConsulta"
            />

            {/* 2. MINHAS CONSULTAS (Novo Card) */}
            <ActionCard 
              icon={IconClipboardList}
              title="MINHAS CONSULTAS"
              description="Histórico e agendamentos futuros"
              buttonText="IR PRA SEÇÃO"
              path="/minhasconsultaspaciente"
            />

            {/* 3. MINHAS CIRURGIAS */}
            <ActionCard 
              icon={IconCalendarCheck}
              title="MINHAS CIRURGIAS"
              description="Acompanhe seus procedimentos"
              buttonText="IR PRA SEÇÃO"
              path="/minhascirurgiaspaciente"
            />

            {/* 4. EDITAR PERFIL */}
            <ActionCard 
              icon={FaUserCog}
              title="EDITAR PERFIL"
              description="Atualize seus dados pessoais"
              buttonText="IR PRA SEÇÃO"
              path="/perfilpaciente"
            />
            
          </S.CardGrid>
        </S.MainContent>

        <Footer />
      </S.PacientePortalContainer>
    </>
  );
}