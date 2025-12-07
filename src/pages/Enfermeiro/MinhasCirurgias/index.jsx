import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom"; 

// Renomeado de CirurgiaCard para EscalaCard
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
                    
                    {/* O StatusBadge agora usa a propriedade 'status' da cirurgia */}
                    <S.StatusBadge status={procedimento.status}>
                        {/* Exibe o status da cirurgia (ex: EM PREPARO, CONCLUÍDO) */}
                        {procedimento.status ? procedimento.status.toUpperCase() : "AGENDADO"}
                    </S.StatusBadge>
                </div>
                
                {/* Mostra o médico responsável */}
                <p style={{marginTop: "5px", color: "#666"}}>Médico: {procedimento.medico_responsavel_nome || "A definir"}</p>
            </S.CardHeader>

            <S.CardDetalhes>
                <p><strong>Data/Hora:</strong> {dataFormatada}</p>
                <p><strong>Duração Estimada:</strong> {procedimento.duracao_minutos} min</p>
                {/* n_sala e tipo_sala são chaves do seu BD */}
                <p><strong>Local:</strong> Sala {procedimento.n_sala} ({procedimento.tipo_sala})</p>
            </S.CardDetalhes>
            
            {/* Adiciona área de ação específica para o Enfermeiro */}
            <S.ActionArea>
                <S.ActionBtn secondary>Ver Checklist</S.ActionBtn>
                <S.ActionBtn>Marcar Preparo</S.ActionBtn>
            </S.ActionArea>

        </S.CardContainer>
    );
}

// Renomeado de MinhasCirurgias para MinhaEscala
export default function MinhaEscala() {
    const [procedimentos, setProcedimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Adicionado para futura navegação (ex: login, detalhes)

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    // Altera a chave de busca para cpfEnfermeiro
    const cpfEnfermeiro = usuario ? usuario.cpf : ""; 

    useEffect(() => {
        async function carregarEscala() {
            if (!cpfEnfermeiro) return;

            try {
                // Altera a rota para buscar a escala do enfermeiro
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
    }, [cpfEnfermeiro]); // Dependência ajustada para cpfEnfermeiro

    return (
        <>
            <S.GlobalStyles />
            {/* Renomeado para MinhaEscalaContainer */}
            <S.MinhaEscalaContainer>
                <Header />

                <S.MainContent>
                    <h1>Minha Escala de Procedimentos</h1>
                    <p>Procedimentos cirúrgicos agendados onde você está escalado para suporte de enfermagem.</p>

                    <S.CirurgiaList>
                        {loading ? (
                            <p>Carregando...</p>
                        ) : procedimentos.length > 0 ? (
                            // Mapeia para EscalaCard
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