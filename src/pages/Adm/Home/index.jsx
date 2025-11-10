import React from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { FaCalendarAlt, FaCut, FaUserCog, FaHeartbeat } from "react-icons/fa";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

function ActionCard({ icon, title, description, onClick }) {
  return (
    <S.ActionCardContainer onClick={onClick}>
      <S.ActionCardIcon>{icon}</S.ActionCardIcon>
      <h3>{title}</h3>
      <p>{description}</p>
      <S.ActionCardButton>IR PRA SESSÃO</S.ActionCardButton>
    </S.ActionCardContainer>
  );
}

export default function HomePaciente() {
  const navigate = useNavigate();
  const pacienteNome = "Rafael Castro"; // futuramente vem do backend/login

  const items = [
    {
      icon: <FaCalendarAlt size={40} />,
      title: "CADASTRO DE FUNCIONARIOS",
      description: "Cadastro de médicos e enfermeiros",
      route: "/cadastro_medico_paciente",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "CADASTRO DE LEITOS",
      description: "Cadastro de leitos de uti e de leitos da enfermaria",
      route: "/cadastro_medico_paciente",
    },

    {
      icon: <FaCut size={40} />,
      title: "SOLICITAÇÃO DE CIRURGIA",
      description: "Solicitações das cirurgias dos médicos tem que ser aprovadas e modificadas caso necessário",
      route: " ",
    },

    {
      icon: <FaUserCog size={40} />,
      title: "EDITAR PERFIL",
      description: "Atualize seus dados",
      route: " ",
    },
  ];

  function logout() {
    localStorage.removeItem("token");
    navigate("/../login");
  }

  return (
    <>
      <S.GlobalStyles />
      <S.PacientePortalContainer>
        <Header />

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, {pacienteNome}</h1>
            <p>Seu Portal do Paciente</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            {items.map((item, i) => (
              <ActionCard
                key={i}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => navigate(item.route)}
              />
            ))}
          </S.CardGrid>
        </S.MainContent>

        <Footer />
      </S.PacientePortalContainer>
    </>
  );
}
