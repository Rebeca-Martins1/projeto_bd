import React, { useState, useEffect } from "react"; 
import * as S from "./style.js";
import Header from "../../../components/Header"; 
import Footer from "../../../components/Footer"; 

function ConsultaCard({ consulta, isPassada }) {
  // Formata a data para ficar legível (DD/MM/AAAA HH:mm)
  const dataFormatada = new Date(consulta.data_hora).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <S.CardContainer style={{ 
        borderLeft: isPassada ? "5px solid #999" : "5px solid #28a745",
        opacity: isPassada ? 0.8 : 1
    }}>
      <S.CardHeader>
        {/* O Paciente quer ver o nome do MÉDICO */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
            <h3>Dr(a). {consulta.medico_nome}</h3>
            <span style={{
                fontSize: "0.85rem", 
                backgroundColor: "#eee", 
                padding: "4px 8px", 
                borderRadius: "4px",
                color: "#555"
            }}>
                {consulta.especialidade || "Médico"}
            </span>
        </div>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data:</strong> {dataFormatada}</p>
        <p><strong>Tipo:</strong> {consulta.tipo_consulta}</p>
        <p><strong>Local:</strong> Sala {consulta.n_sala} ({consulta.tipo_sala})</p>
        {consulta.observacoes && <p><strong>Obs:</strong> {consulta.observacoes}</p>}
      </S.CardDetalhes>
    </S.CardContainer>
  );
}

export default function MinhasConsultas() {
  const [consultasFuturas, setConsultasFuturas] = useState([]); 
  const [consultasPassadas, setConsultasPassadas] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. Pega o CPF do PACIENTE logado
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const cpfPaciente = usuario ? usuario.cpf : "";

  useEffect(() => {
    async function carregar() {
      if (!cpfPaciente) return;
      try {
        // 2. Chama a rota de PACIENTE (que criamos no passo anterior)
        const resp = await fetch(`http://localhost:5000/paciente/${cpfPaciente}/consultas`);
        
        if (!resp.ok) {
           console.error("Erro ao buscar dados");
           setLoading(false);
           return;
        }

        const dados = await resp.json();

        // 3. Separa o que já foi do que vai acontecer
        const agora = new Date();
        const futuras = [];
        const passadas = [];

        dados.forEach(c => {
            if (new Date(c.data_hora) >= agora) {
                futuras.push(c);
            } else {
                passadas.push(c);
            }
        });

        // Ordena: Futuras (mais próxima primeiro) | Passadas (mais recente primeiro)
        futuras.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
        passadas.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

        setConsultasFuturas(futuras);
        setConsultasPassadas(passadas);

      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [cpfPaciente]);

  return (
    <>
      <S.GlobalStyles />
      <S.MinhasConsultasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Consultas</h1>
          <p>Visualize seus agendamentos médicos.</p>

          {loading ? (
             <p>Carregando...</p>
          ) : (
            <>
                {/* SEÇÃO FUTURAS */}
                <h2 style={{fontSize: '1.4rem', color: '#333', marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                    📅 Agendadas
                </h2>
                <S.ConsultaList>
                    {consultasFuturas.length > 0 ? (
                    consultasFuturas.map((consulta, index) => (
                        <ConsultaCard key={index} consulta={consulta} isPassada={false} />
                    ))
                    ) : (
                    <p style={{color: '#666', fontStyle: 'italic', padding: '10px'}}>Nenhuma consulta futura agendada.</p>
                    )}
                </S.ConsultaList>

                {/* SEÇÃO PASSADAS */}
                <h2 style={{fontSize: '1.4rem', color: '#666', marginTop: '40px', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                    ✅ Histórico
                </h2>
                <S.ConsultaList>
                    {consultasPassadas.length > 0 ? (
                    consultasPassadas.map((consulta, index) => (
                        <ConsultaCard key={index} consulta={consulta} isPassada={true} />
                    ))
                    ) : (
                    <p style={{color: '#666', fontStyle: 'italic', padding: '10px'}}>Nenhum histórico encontrado.</p>
                    )}
                </S.ConsultaList>
            </>
          )}
        </S.MainContent>

        <Footer />
      </S.MinhasConsultasContainer>
    </>
  );
}