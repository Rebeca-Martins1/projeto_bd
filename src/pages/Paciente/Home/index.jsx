import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  TopBar, 
  LogoutBtn, 
  Content, 
  Header, 
  Subtitle, 
  GridArea, 
  Card 
} from "./styles";

import { 
  FaCalendarAlt, 
  FaCut, 
  FaUserCog 
} from "react-icons/fa";

export default function HomePaciente() {
  const navigate = useNavigate();
  const pacienteNome = "Rafael Castro"; // futuramente isso vem do backend/login

  const items = [
    { icon: <FaCalendarAlt size={28} />, label: "CONSULTAS", sub: "Marque sua próxima visita", route: "/consultas" },
    { icon: <FaCut size={28} />, label: "MINHAS CIRURGIAS", sub: "Histórico e agendamentos", route: "/cirurgias" },
    { icon: <FaUserCog size={28} />, label: "EDITAR PERFIL", sub: "Atualize seus dados", route: "/meusdados" },
  ];

  function logout() {
  localStorage.removeItem("token");
  navigate("/../login");
}

  return (
    <Container>

      {/* 🔵 Barra Superior */}
      <TopBar>
        <span>MED MAIS</span>
        <span> Olá, {pacienteNome}</span>
        <LogoutBtn onClick={logout}>Sair</LogoutBtn>
      </TopBar>

      {/* Conteúdo */}
      <Content>
        <Header>BEM-VINDO, {pacienteNome}</Header>
        <Subtitle>Seu Portal do Paciente</Subtitle>

        <GridArea>
          {items.map((item, i) => (
            <Card key={i} onClick={() => navigate(item.route)}>
              {item.icon}
              <span>{item.label}</span>
            </Card>
          ))}
        </GridArea>
      </Content>
    </Container>
  );
}
