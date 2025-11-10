import React from "react";
import * as S from "./styles";
import { IconHeartPulse } from "../../icons"; // você pode mover seus ícones pra uma pasta própria

export default function Header() {
  return (
    <S.TopHeader>
      <S.TopHeaderContent>
        <S.Logo>
          <IconHeartPulse />
          <S.LogoTitle>Nome do Hospital</S.LogoTitle>
        </S.Logo>
      </S.TopHeaderContent>
    </S.TopHeader>
  );
}
