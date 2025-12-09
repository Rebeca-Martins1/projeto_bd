import React from "react";
import { useNavigate } from "react-router-dom"; 
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

import { IconSettings, IconScissors, IconBed, IconHospital } from "../../../icons";

function ActionCard({ icon, title, description, buttonText, onClick }) {
    return (
        <S.ActionCardContainer onClick={onClick}>
            <S.ActionCardIcon>{React.createElement(icon)}</S.ActionCardIcon>
            <h3>{title}</h3>
            <p>{description}</p>
            <S.ActionCardButton onClick={onClick}>{buttonText}</S.ActionCardButton>
        </S.ActionCardContainer>
    );
}

export default function HomeEnfermeiro() {
    const navigate = useNavigate(); 

    return (
        <>
            <S.GlobalStyles />
            <S.EnfermeiroPortalContainer>
                <Header />

                <S.MainContent>
                    <S.WelcomeMessage>
                        {/* Dica: Depois você pode trocar isso por uma variável de estado com o nome real */}
                        <h1>BEM-VINDO, ENFERMEIRO</h1> 
                        <p>Portal do Enfermeiro</p>
                    </S.WelcomeMessage>

                    <S.CardGrid>
                        
                        {/* 1. EDITAR PERFIL */}
                        <ActionCard 
                            icon={IconSettings}
                            title="EDITAR PERFIL"
                            description="Atualize suas informações"
                            buttonText="IR PRA SEÇÃO"
                            // CORRIGIDO: Rota deve ser igual ao main.jsx (/editarperfil)
                            onClick={() => navigate("/editarperfil")} 
                        />
                        
                        {/* 2. MINHAS CIRURGIAS (ESCALA) */}
                        <ActionCard 
                            icon={IconScissors}
                            title="MINHA ESCALA"
                            description="Visualize seus procedimentos agendados"
                            buttonText="IR PRA SEÇÃO"
                            // CORRIGIDO: Rota deve ser igual ao main.jsx (/cirurgiasenfermeiro)
                            onClick={() => navigate("/cirurgiasenfermeiro")} 
                        />
                        
                        {/* 3. LEITOS */}
                        <ActionCard 
                            icon={IconBed}
                            title="LEITOS DE RESPONSABILIDADE"
                            description="Veja suas ocupações e os detalhes dos leitos"
                            buttonText="IR PRA SEÇÃO"
                            // CORRIGIDO: Rota deve ser igual ao main.jsx (/leitos)
                            onClick={() => navigate("/leitos")} 
                        />

                        {/* 4. PLANTÃO */}
                        <ActionCard 
                            icon={IconHospital}
                            title="PLANTÃO"
                            description="Cadastre e veja seu plantão aqui"
                            buttonText="IR PRA SEÇÃO"
                            // CORRIGIDO: Rota deve ser igual ao main.jsx (/plantao)
                            onClick={() => navigate("/plantao")} 
                        />
                    </S.CardGrid>
                </S.MainContent>

                <Footer />
            </S.EnfermeiroPortalContainer>
        </>
    );
}