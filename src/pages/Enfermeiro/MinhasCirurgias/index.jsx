import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom"; 

// Componente do Card (Botões removidos aqui conforme seu pedido)
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

        </S.CardContainer>
    );
}

// Componente Principal da Tela
export default function MinhaEscala() {
    const [procedimentos, setProcedimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    // Recupera dados do usuário logado
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const cpfEnfermeiro = usuario ? usuario.cpf : ""; 

    useEffect(() => {
        async function carregarEscala() {
            if (!cpfEnfermeiro) return;

            try {
                // Rota do backend
                const resp = await fetch(`http://localhost:5000/enfermeiro/${cpfEnfermeiro}/escala`);
                
                if (resp.ok) {
                    const dados = await resp.json();

                    // --- INÍCIO DA CORREÇÃO DE DUPLICIDADE ---
                    // Se o banco retornar 3 linhas para a mesma cirurgia, nós filtramos aqui.
                    const cirurgiasUnicas = new Map();

                    dados.forEach(item => {
                        // Cria uma chave única baseada na hora e no paciente
                        const chaveUnica = `${item.data_hora}-${item.cpf_paciente}`;

                        // Se essa chave ainda não existe no Map, adiciona.
                        // Se já existe, ignora (evita duplicata).
                        if (!cirurgiasUnicas.has(chaveUnica)) {
                            cirurgiasUnicas.set(chaveUnica, item);
                        }
                    });

                    // Transforma o Map de volta em array para o React renderizar
                    setProcedimentos(Array.from(cirurgiasUnicas.values()));
                    // --- FIM DA CORREÇÃO ---

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
                            // Renderiza a lista filtrada
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