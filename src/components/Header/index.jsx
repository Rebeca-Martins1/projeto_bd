import React from "react";
import * as S from "./styles";
import { FaHeartbeat } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Header({ isLogin = false }) {
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/cadastro");
  };

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

         {isLogin ? (
          <S.RegisterBtn onClick={goToRegister}>
            Cadastro
          </S.RegisterBtn>
        ) : (
          <S.LogoutBtn onClick={logout}>
            Sair
          </S.LogoutBtn>
        )}
        
      </S.TopHeaderContent>
    </S.TopHeader>
  );
}
