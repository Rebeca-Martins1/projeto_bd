import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom"; 

// Componente do Card (Botões removidos aqui)
function EscalaCard({ procedimento }) {
    
    // Formatar data para ficar legível (DD/MM/AAAA HH:mm)
    const dataFormatada = new Date(procedimento.data_hora).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });

    return (
        <S.CardContainer>
            <S.CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    
                    {/* Foco no Paciente */}
                    <h3>{procedimento.paciente_nome || "Paciente"}</h3>
                    
                    {/* Status Badge */}
                    <S.StatusBadge status={procedimento.status}>
                        {procedimento.status ? procedimento.status.toUpperCase() : "AGENDADO"}
                    </S.StatusBadge>
                </div>
                
                {/* Mostra o médico responsável */}
                <p style={{marginTop: "5px", color: "#666"}}>Médico: {procedimento.medico_responsavel_nome || "A definir"}</p>
            </S.CardHeader>

            <S.CardDetalhes>
                <p><strong>Data/Hora:</strong> {dataFormatada}</p>
                <p><strong>Duração Estimada:</strong> {procedimento.duracao_minutos} min</p>
                <p><strong>Local:</strong> Sala {procedimento.n_sala} ({procedimento.tipo_sala})</p>
            </S.CardDetalhes>
            
            {/* A área de botões (ActionArea) foi removida completamente aqui */}

        </S.CardContainer>
    );
}

// Componente Principal da Tela
export default function MinhaEscala() {
    const [procedimentos, setProcedimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const cpfEnfermeiro = usuario ? usuario.cpf : ""; 

    useEffect(() => {
        async function carregarEscala() {
            if (!cpfEnfermeiro) return;

            try {
                // Certifique-se que esta rota corresponde ao seu backend (Opção A ou B discutida anteriormente)
                const resp = await fetch(`http://localhost:5000/enfermeiro/${cpfEnfermeiro}/escala`);
                
                if (resp.ok) {
                    const dados = await resp.json();
                    setProcedimentos(dados);
                } else {
                    console.error("Erro ao buscar escala do enfermeiro");
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
            } finally {
                setLoading(false);
            }
        }

        carregarEscala();
    }, [cpfEnfermeiro]); 

    return (
        <>
            <S.GlobalStyles />
            <S.MinhaEscalaContainer>
                <Header />

                <S.MainContent>
                    <h1>Minha Escala de Procedimentos</h1>
                    <p>Procedimentos cirúrgicos agendados onde você está escalado para suporte de enfermagem.</p>

                    <S.CirurgiaList>
                        {loading ? (
                            <p>Carregando...</p>
                        ) : procedimentos.length > 0 ? (
                            // Renderiza os cards sem os botões
                            procedimentos.map((proc, index) => (
                                <EscalaCard key={index} procedimento={proc} />
                            ))
                        ) : (
                            <p>Nenhum procedimento agendado encontrado na sua escala.</p>
                        )}
                    </S.CirurgiaList>
                </S.MainContent>

                <Footer />
            </S.MinhaEscalaContainer>
        </>
    );
}