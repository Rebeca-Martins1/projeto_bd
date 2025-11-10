import React from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { FaCalendarAlt, FaCut, FaUserCog, FaHeartbeat } from "react-icons/fa";

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
      title: "CONSULTAS",
      description: "Marque sua próxima visita",
      route: "/MarcarConsulta", // 👈 Rota para a tela de marcação de consulta
    },
    {
      icon: <FaCut size={40} />,
      title: "CIRURGIAS",
      description: "Histórico e agendamentos",
      route: "/cirurgias",
    },
    {
      icon: <FaUserCog size={40} />,
      title: "EDITAR PERFIL",
      description: "Atualize seus dados",
      route: "/meusdados",
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
        {/* 🔵 TOPO */}
        <S.TopHeader>
          <S.TopHeaderContent>
            <S.Logo>
              <FaHeartbeat size={24} />
              <S.LogoTitle>MED MAIS</S.LogoTitle>
            </S.Logo>
            <S.LogoutBtn onClick={logout}>Sair</S.LogoutBtn>
          </S.TopHeaderContent>
        </S.TopHeader>

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

        {/* --- RODAPÉ --- */}
        <S.Footer>
          <S.FooterGrid>
            <S.FooterCol>
              <h5>Sobre nós</h5>
              <p>Informações sobre o Hospital.</p>
            </S.FooterCol>

            <S.FooterCol>
              <h5>Informações para contato</h5>
              <ul>
                <li>Rua do Hospital</li>
                <li>Cidade, estado, cep</li>
                <li>Telefone</li>
                <li>email@hospital.com</li>
              </ul>
            </S.FooterCol>
          </S.FooterGrid>
        </S.Footer>
      </S.PacientePortalContainer>
    </>
  );
}
