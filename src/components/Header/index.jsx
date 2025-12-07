import React from "react";
import * as S from "./styles";
import { FaHeartbeat } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  /** Páginas principais (que mostram "Sair") */
  const homePages = [
    "/homepaciente",
    "/homemedico",
    "/homeenfermeiro",
    "/homeadm",
    "/conselhopresidente"
  ];

  /** Mapa de rotas -> página de retorno */
  const backRoutes = {
    // Paciente
    "/marcarconsulta": "/homepaciente",
    "/perfilpaciente": "/homepaciente",
    "/minhascirurgiaspaciente": "/homepaciente",
    "/minhasconsultaspaciente": "/homepaciente",

    // Médico
    "/agendarcirurgia": "/homemedico",
    "/minhascirurgias": "/homemedico",
    "/minhasconsultas": "/homemedico",

    // Enfermeiro
    "/plantao": "/homeenfermeiro",

    // Administrador
    "/cadastro_medico_paciente": "/homeadm",
    "/cadastro_leitos": "/homeadm",
    "/cadastro_salas": "/homeadm",
    "/desativar_leitos": "/homeadm",
    "/desativar_salas": "/homeadm",
    "/desativar_funcionarios": "/homeadm",
    "/perfiladm": "/homeadm",
    "/solicitacao": "/homeadm",

    // Conselho
    "/ocupacaoleitos": "/conselhopresidente",
    "/ocupacaosalas": "/conselhopresidente",
    "/atividademedica": "/conselhopresidente",
    "/atividadecirurgica": "/conselhopresidente",
    "/historicopacientes": "/conselhopresidente",
    "/recursoshumanos": "/conselhopresidente"
  };

  /** 🔙 Botão voltar */
  const goBack = () => {
    // === Regra especial ===
    if (path.includes("/marcarconsulta")) return navigate(-1); // volta realmente de onde veio

    // busca rota correspondente
    const redirect = Object.entries(backRoutes).find(([route]) =>
      path.includes(route)
    );

    return redirect ? navigate(redirect[1]) : navigate("/"); // fallback para login
  };

  /** Botões principais */
  const logout = () => navigate("/");
  const goToRegister = () => navigate("/cadastro");

  const isLoginPage = path === "/";
  const isCadastroPage = path === "/cadastro";
  const isHome = homePages.includes(path);

  return (
    <S.TopHeader>
      <S.TopHeaderContent>
        
        <S.Logo>
          <FaHeartbeat size={24}/>
          <S.LogoTitle>MED MAIS</S.LogoTitle>
        </S.Logo>

        {isLoginPage && (
          <S.Button onClick={goToRegister}>Cadastro</S.Button>
        )}

        {isCadastroPage && (
          <S.Button onClick={logout}>Entrar</S.Button>
        )}

        {isHome && (
          <S.LogoutBtn onClick={logout}>Sair</S.LogoutBtn>
        )}

        {!isLoginPage && !isCadastroPage && !isHome && (
          <S.LogoutBtn onClick={goBack}>Voltar</S.LogoutBtn>
        )}

      </S.TopHeaderContent>
    </S.TopHeader>
  );
}
