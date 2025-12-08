import React from "react";
import { useNavigate } from "react-router-dom"; 
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

import { IconSettings, IconScissors, IconBed, IconHospital } from "../../../icons";

function ActionCard({ icon, title, description, buttonText, onClick }) {
    return (
        // Aplicamos onClick ao container inteiro para uma área de clique maior
        <S.ActionCardContainer onClick={onClick}>
            <S.ActionCardIcon>{React.createElement(icon)}</S.ActionCardIcon>
            <h3>{title}</h3>
            <p>{description}</p>
            {/* O botão também deve ter a função para garantir o comportamento correto */}
            <S.ActionCardButton onClick={onClick}>{buttonText}</S.ActionCardButton>
        </S.ActionCardContainer>
    );
}

export default function HomeEnfermeiro() {
    // 3. Inicializar o hook de navegação
    const navigate = useNavigate(); 

    return (
        <>
            <S.GlobalStyles />
            <S.EnfermeiroPortalContainer>
                <Header />

                <S.MainContent>
                    <S.WelcomeMessage>
                        <h1>BEM-VINDO, [NOME DO ENFERMEIRO]</h1>
                        <p>Portal do Enfermeiro</p>
                    </S.WelcomeMessage>

                    <S.CardGrid>
                        
                        {/* 1. EDITAR PERFIL */}
                        <ActionCard 
                            icon={IconSettings}
                            title="EDITAR PERFIL"
                            description="Atualize suas informações"
                            buttonText="IR PRA SEÇÃO"
                            // Adicionar a função de navegação
                            onClick={() => navigate("/perfil-enfermeiro/editar")} 
                        />
                        
                        {/* 2. MINHAS CIRURGIAS (ESCALA) */}
                        <ActionCard 
                            icon={IconScissors}
                            title="MINHA ESCALA" // Renomeado para ser mais claro
                            description="Visualize seus procedimentos agendados"
                            buttonText="IR PRA SEÇÃO"
                            // Adicionar a função de navegação
                            onClick={() => navigate("/enfermeiro/escala")} 
                        />
                        
                        {/* 3. LEITOS SOB MINHA RESPONSABILIDADE */}
                        <ActionCard 
                            icon={IconBed}
                            title="LEITOS DE RESPONSABILIDADE" // Título mais conciso
                            description="Veja suas ocupações e os detalhes dos leitos"
                            buttonText="IR PRA SEÇÃO"
                            // Adicionar a função de navegação
                            onClick={() => navigate("/enfermeiro/meus-leitos")} 
                        />

                        {/* 4. PLANTÃO */}
                        <ActionCard 
                            icon={IconHospital}
                            title="PLANTÃO"
                            description="Cadastre e veja seu plantão aqui"
                            buttonText="IR PRA SEÇÃO"
                            // Adicionar a função de navegação
                            onClick={() => navigate("/enfermeiro/plantao")} 
                        />
                    </S.CardGrid>
                </S.MainContent>

                <Footer />
            </S.EnfermeiroPortalContainer>
        </>
    );
}