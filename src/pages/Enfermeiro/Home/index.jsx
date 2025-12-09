import React, { useEffect, useState } from "react"; // 1. Adicionado useEffect e useState
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
    // 2. Estado para armazenar o usuário logado
    const [usuario, setUsuario] = useState(null);

    // 3. Efeito para buscar os dados no localStorage ao carregar a página
    useEffect(() => {
        const dadosSalvos = localStorage.getItem("usuarioLogado");
        if (dadosSalvos) {
            setUsuario(JSON.parse(dadosSalvos));
        } else {
            // Se não tiver usuário logado, manda de volta pro login
            navigate("/login");
        }
    }, [navigate]);

    // 4. Se o usuário ainda não carregou, exibe carregando (evita erro de null)
    if (!usuario) {
        return <p style={{padding: "20px"}}>Carregando...</p>;
    }

    return (
        <>
            <S.GlobalStyles />
            <S.EnfermeiroPortalContainer>
                <Header />

                <S.MainContent>
                    <S.WelcomeMessage>
                        {/* 5. Agora exibe o nome dinâmico vindo do banco/login */}
                        <h1>BEM-VINDO, {usuario.nome ? usuario.nome.toUpperCase() : "ENFERMEIRO"}</h1> 
                        <p>Portal do Enfermeiro</p>
                    </S.WelcomeMessage>

                    <S.CardGrid>
                        
                        {/* 1. EDITAR PERFIL */}
                        <ActionCard 
                            icon={IconSettings}
                            title="EDITAR PERFIL"
                            description="Atualize suas informações"
                            buttonText="IR PRA SEÇÃO"
                            onClick={() => navigate("/editarperfil")} 
                        />
                        
                        {/* 2. MINHAS CIRURGIAS */}
                        <ActionCard 
                            icon={IconScissors}
                            title="MINHAS CIRURGIAS"
                            description="Visualize seus procedimentos agendados"
                            buttonText="IR PRA SEÇÃO"
                            onClick={() => navigate("/cirurgiasenfermeiro")} 
                        />
                        
                        {/* 3. LEITOS */}
                        <ActionCard 
                            icon={IconBed}
                            title="LEITOS DE RESPONSABILIDADE"
                            description="Veja suas ocupações e os detalhes dos leitos"
                            buttonText="IR PRA SEÇÃO"
                            onClick={() => navigate("/leitos")} 
                        />

                        {/* 4. PLANTÃO */}
                        <ActionCard 
                            icon={IconHospital}
                            title="PLANTÃO"
                            description="Cadastre e veja seu plantão aqui"
                            buttonText="IR PRA SEÇÃO"
                            onClick={() => navigate("/plantao")} 
                        />
                    </S.CardGrid>
                </S.MainContent>

                <Footer />
            </S.EnfermeiroPortalContainer>
        </>
    );
}