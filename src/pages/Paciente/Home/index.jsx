import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { FaCalendarAlt, FaCut, FaUserCog } from "react-icons/fa";
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

export default function PortalPaciente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null); // ✅ estado inicial

  useEffect(() => {
    // roda apenas uma vez
    const dadosSalvos = localStorage.getItem("usuarioLogado");
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    } else {
      navigate("/login"); // mais seguro que window.location.href
    }
  }, [navigate]);

  if (!usuario) {
    // enquanto o usuário não é carregado, evita renderizar
    return <p>Carregando...</p>;
  }

  const items = [
    {
      icon: <FaCalendarAlt size={40} />,
      title: "CONSULTAS",
      description: "Marque sua próxima visita",
      route: "/MarcarConsulta",
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
    localStorage.removeItem("usuarioLogado");
    navigate("/login");
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
