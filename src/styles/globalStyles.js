import { createGlobalStyle } from "styled-components";

const myGlobalStyles =  createGlobalStyle `

    *{
        margin: 0;
        padding:0;
        box-sizing: border-box;
        font-family: "Noto Sans", sans-serif;
    }

    body {
        min-height: 100vh;
        width:100vh;
        background: linear-gradient(180deg, #000000ff 0%, rgba(27, 26, 121, 0.8) 100%);
    }
`

export default myGlobalStyles