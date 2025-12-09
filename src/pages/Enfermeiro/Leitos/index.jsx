import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom"; 

// Componente Card para o Leito (ajustado para ser um Card de Leito único)
function LeitoCard({ leito }) {
    
    // Define a cor de acordo com o tipo (Ex: UTI vermelho, ENFERMARIA azul)
    const isUTI = leito.tipo_leito_responsavel === 'UTI';

    return (
        <S.CardContainer isUTI={isUTI}>
            <S.CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    
                    {/* Título do Leito */}
                    <h3>Leito {leito.n_sala} ({leito.tipo_leito_responsavel})</h3>
                    
                    {/* Status de Disponibilidade (usando o estilo do seu StatusBadge) */}
                    <S.StatusBadge status={leito.disponivel ? "LIVRE" : "OCUPADO"}>
                        {leito.disponivel ? "LIVRE" : "OCUPADO"}
                    </S.StatusBadge>
                </div>
                
                {/* Informação principal do enfermeiro */}
                <p style={{marginTop: "5px", color: "#666"}}>Seu Leito de Responsabilidade</p>
            </S.CardHeader>

            <S.CardDetalhes>
                <p><strong>Tipo:</strong> {leito.tipo_leito_responsavel}</p>
                <p><strong>Capacidade:</strong> {leito.capacidade} pacientes</p>
                <p><strong>Ocupação Atual:</strong> {leito.quant_paciente} pacientes</p>
            </S.CardDetalhes>
            
    

        </S.CardContainer>
    );
}

// Componente principal: MeusLeitos
export default function MeusLeitos() {
    const [leito, setLeito] = useState(null); // Estado para um único leito (ou null se não alocado)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const cpfEnfermeiro = usuario ? usuario.cpf : ""; 

    useEffect(() => {
        async function carregarLeito() {
            if (!cpfEnfermeiro) return;

            try {
                // Rota sugerida: buscar dados do leito alocado ao enfermeiro
                // O backend deve unir ENFERMEIRO -> LEITOS
                const resp = await fetch(`http://localhost:5000/enfermeiro/${cpfEnfermeiro}/leitos`);
                
                if (resp.ok) {
                    const dados = await resp.json();
                    // Assumimos que o backend retorna um único objeto de leito ou null
                    setLeito(dados); 
                } else {
                    console.error("Erro ao buscar leito do enfermeiro");
                    setLeito(null);
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
            } finally {
                setLoading(false);
            }
        }

        carregarLeito();
    }, [cpfEnfermeiro]);

    return (
        <>
            <S.GlobalStyles />
            {/* Usamos o MinhasCirurgiasContainer renomeado para manter a estrutura */}
            <S.MeusLeitosContainer> 
                <Header />

                <S.MainContent>
                    <h1>Meus Leitos de Responsabilidade</h1>
                    <p>Informações detalhadas sobre o leito ou sala onde você está escalado como principal responsável.</p>

                    <S.LeitoGrid> {/* Novo contêiner para o Card de Leito */}
                        {loading ? (
                            <p>Carregando informações do leito...</p>
                        ) : leito && leito.n_sala ? (
                            <LeitoCard leito={leito} />
                        ) : (
                            <p>Você não possui leito de responsabilidade alocado atualmente. </p>
                        )}
                    </S.LeitoGrid>
                </S.MainContent>

                <Footer />
            </S.MeusLeitosContainer>
        </>
    );
}