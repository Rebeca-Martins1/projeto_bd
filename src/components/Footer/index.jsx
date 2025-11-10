import React from "react";
import * as S from "./styles";

export default function Footer() {
  return (
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
            <li>email</li>
          </ul>
        </S.FooterCol>
      </S.FooterGrid>
    </S.Footer>
  );
}
