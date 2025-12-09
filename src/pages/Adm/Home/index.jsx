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

export default function HomeAdm() {
  const navigate = useNavigate();
  
  const items = [
    {
      icon: <FaCalendarAlt size={40} />,
      title: "CADASTRO DE FUNCIONARIOS",
      description: "Cadastro de médicos e enfermeiros",
      route: "/cadastro_profissionais",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "CADASTRO DE LEITOS",
      description: "Cadastro de leitos de uti e de leitos da enfermaria",
      route: "/cadastro_leitos",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "CADASTRO DE SALAS",
      description: "Cadastro de consultorios e de salas de cirurgia",
      route: "/cadastro_salas",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "DESATIVAR/ATIVAR LEITOS",
      description: "Desativa leitos para caso aquele leito não seja mais usado e ativa caso mude de ideia",
      route: "/desativar_leitos",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "DESATIVAR/ATIVAR SALAS",
      description: "Desativa salas para caso aquela sala não seja mais usada e ativa caso mude de ideia",
      route: "/desativar_salas",
    },

    {
      icon: <FaCalendarAlt size={40} />,
      title: "DESATIVAR/ATIVAR PROFISSIONAIS",
      description: "Desativa proficionais para caso ocorra uma demissão e ativa caso seja recontratado",
      route: "/desativar_funcionarios",
    },

    {
      icon: <FaCut size={40} />,
      title: "SOLICITAÇÃO DE CIRURGIA",
      description: "Solicitações das cirurgias dos médicos tem que ser aprovadas e modificadas caso necessário",
      route: "/solicitacao",
    },

    {
      icon: <FaUserCog size={40} />,
      title: "ALOCA ENFERMEIRO LEITO",
      description: "Aloca o enfermeiro no leito que irá trabalhar naquele dia",
      route: "/aloca_enfermeiro_leito",
    },

    {
      icon: <FaUserCog size={40} />,
      title: "EDITAR PERFIL",
      description: "Atualize seus dados",
      route: "/perfiladm",
    },
  ];

  function logout() {
    localStorage.removeItem("token");
    navigate("/../login");
  }
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  return (
    <>
      <S.GlobalStyles />
      <S.PacientePortalContainer>
        <Header />

        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, {usuario.nome}</h1>
            <p>Seu Portal do Administrador</p>
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
