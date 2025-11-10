import React from "react";
import * as S from "./styles";
import { FaHeartbeat } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";


export default function Header({ isLogin = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/";
  const isCadastroPage = location.pathname === "/cadastro";

  const goToRegister = () => navigate("/cadastro");
  const logout = () => {
    navigate("/");
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
        ) : (
          <S.LogoutBtn onClick={logout}>Sair</S.LogoutBtn>
        )}

        
      </S.TopHeaderContent>
    </S.TopHeader>
  );
}
