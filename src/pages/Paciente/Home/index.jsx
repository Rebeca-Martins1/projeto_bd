import React from "react";
import { useNavigate } from "react-router-dom";
import { FaNotesMedical, FaUserMd, FaHeartbeat, FaHospitalUser, FaPills, FaSignOutAlt, FaCommentDots } from "react-icons/fa";
import { Container, Header, Subtitle, GridArea, Card } from "./styles";

export default function HomePaciente() {
  const navigate = useNavigate();

  const items = [
    { icon: <FaHospitalUser size={26} />, label: "Meus dados", route: "/meusdados" },
    { icon: <FaUserMd size={26} />, label: "Minhas consultas", route: "/consultas" },
    { icon: <FaNotesMedical size={26} />, label: "Meus exames", route: "/exames" },
    { icon: <FaHeartbeat size={26} />, label: "Histórico médico", route: "/historico" },
    { icon: <FaPills size={26} />, label: "Medicações", route: "/medicacoes" },
    { icon: <FaCommentDots size={26} />, label: "Suporte", route: "/suporte" },
    { icon: <FaSignOutAlt size={26} />, label: "Sair", route: "/" },
  ];

  return (
    <Container>
      <Header>Bem-vindo, Paciente 👋</Header>
      <Subtitle>Selecione uma opção e cuide da sua saúde</Subtitle>

      <GridArea>
        {items.map((item, i) => (
          <Card key={i} onClick={() => navigate(item.route)}>
            {item.icon}
            <span>{item.label}</span>
          </Card>
        ))}
      </GridArea>
    </Container>
  );
}