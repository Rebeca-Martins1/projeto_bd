import React from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { FaUserMinus, FaUserCog, FaStethoscope, FaUserSlash, FaDoorClosed, FaDoorOpen, FaHospital, FaUserNurse, FaBan, FaUserPlus, FaToggleOn} from "react-icons/fa";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { FaBed } from "react-icons/fa6";

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
    icon: <FaUserPlus size={40} />, 
    title: "CADASTRO DE FUNCIONARIOS",
    description: "Cadastro de médicos e enfermeiros",
    route: "/cadastro_profissionais",
  },

  {
    icon: <FaBed size={40} />,
    title: "CADASTRO DE LEITOS",
    description: "Cadastro de leitos de UTI e enfermaria",
    route: "/cadastro_leitos",
  },

  {
    icon: <FaHospital size={40} />, 
    title: "CADASTRO DE SALAS",
    description: "Cadastro de consultórios e salas de cirurgia",
    route: "/cadastro_salas",
  },

  {
    icon: <FaToggleOn size={40} />, 
    title: "DESATIVAR/ATIVAR LEITOS",
    description: "Gerencie a ativação e desativação dos leitos",
    route: "/desativar_leitos",
  },

  {
    icon: <FaToggleOn size={40} />,
    title: "DESATIVAR/ATIVAR SALAS",
    description: "Gerencie a ativação e desativação das salas",
    route: "/desativar_salas",
  },

  {
    icon: <FaUserMinus size={40} />, 
    title: "DESATIVAR/ATIVAR PROFISSIONAIS",
    description: "Desative ou reative profissionais",
    route: "/desativar_funcionarios",
  },

  {
    icon: <FaStethoscope size={40} />, 
    title: "SOLICITAÇÃO DE CIRURGIA",
    description: "Aprove ou modifique solicitações de cirurgia",
    route: "/solicitacao",
  },

  {
    icon: <FaUserNurse size={40} />, 
    title: "ALOCA ENFERMEIRO LEITO",
    description: "Alocação do enfermeiro no leito do dia",
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
