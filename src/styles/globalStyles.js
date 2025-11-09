// GlobalStyles.js - Arquivo Corrigido

import { createGlobalStyle } from "styled-components";

const myGlobalStyles = createGlobalStyle`

    *{
        margin: 0;
        padding:0;
        box-sizing: border-box;
        font-family: "Noto Sans", sans-serif;
    }

    body {
        // CORRIGIDO: Use 100% ou 100vw para largura total
        width: 100%; 
        min-height: 100vh;
        
        // REMOVIDO: O gradiente que estava causando o fundo roxo.
        // Opcionalmente, defina aqui a cor de fundo desejada para todo o app, 
        // que é #f8fafc no seu Container. Se o Container preencher tudo, 
        // essa linha é menos crítica, mas ajuda a garantir:
        background: #f8fafc; 
    }
`;

export default myGlobalStyles;