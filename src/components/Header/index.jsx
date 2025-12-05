import React from "react";
import * as S from "./styles";
import { FaHeartbeat } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header({ isLogin = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/";
  const isCadastroPage = location.pathname === "/cadastro";

  const isHomePage = 
    location.pathname === "/homepaciente" || 
    location.pathname === "/homemedico" || 
    location.pathname === "/homeenfermeiro" || 
    location.pathname === "/homeadm" || 
    location.pathname === "/conselhopresidente";

  const goToRegister = () => navigate("/cadastro");

  const logout = () => navigate("/");

  const goBack = () => {
    const path = location.pathname;

    if (
      path.includes("/marcarconsulta") ||
      path.includes("/perfilpaciente") 
    ) {
      navigate("/homepaciente");
    } 
    else if (
      path.includes("/agendarcirurgia") ||
      path.includes("/minhascirurgias") ||
      path.includes("/minhasconsultas") 
    ) {
      navigate("/homemedico");
    } else if (
      path.includes("/plantao") 
    ) {
      navigate("/homeenfermeiro");
    } else if (
      path.includes("/cadastro_medico_paciente") ||
      path.includes("/cadastro_leitos") ||
      path.includes("/cadastro_salas") ||
      path.includes("/desativar_leitos") ||
      path.includes("desativar_salas") ||
      path.includes("/desativar_funcionarios") ||
      path.includes("/perfiladm") ||
      path.includes("/solicitacao")
    ) {
      navigate("/homeadm");
    } else if (
      path.includes("/ocupacaoleitos") ||
      path.includes("/ocupacaosalas") ||
      path.includes("/atividademedica") ||
      path.includes("/atividadecirurgica") ||
      path.includes("/historicopacientes") ||
      path.includes("/recursoshumanos")
    ) {
      navigate("/conselhopresidente");
    } 
  };

  return (
    <S.TopHeader>
      <S.TopHeaderContent>
        <S.Logo>
          <FaHeartbeat size={24} />
          <S.LogoTitle>MED MAIS</S.LogoTitle>
        </S.Logo>

        {isLoginPage ? (
          <S.Button onClick={goToRegister}>Cadastro</S.Button>
        ) : isCadastroPage ? (
          <S.Button onClick={logout}>Entrar</S.Button>
        ) : isHomePage ? (
          <S.LogoutBtn onClick={logout}>Sair</S.LogoutBtn>
        ) : (
          <S.LogoutBtn onClick={goBack}>Voltar</S.LogoutBtn>
        )}
      </S.TopHeaderContent>
    </S.TopHeader>
  );
}
