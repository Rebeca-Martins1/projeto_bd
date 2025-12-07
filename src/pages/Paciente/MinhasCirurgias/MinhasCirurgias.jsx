import React, { useState, useEffect } from "react";
import * as S from "./styles.js"; 
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

// Componente CirurgiaCard (mantido, pois exibe os detalhes de uma cirurgia)
function CirurgiaCard({ cirurgia }) {
  
  const dataFormatada = new Date(cirurgia.data_hora).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <S.CardContainer>
      <S.CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h3>Cirurgia em: {dataFormatada.split(' ')[0]}</h3> 
          
          <S.StatusBadge aprovada={cirurgia.aprovada} status={cirurgia.status}>
            {cirurgia.aprovada ? "APROVADA" : "EM ANÁLISE / PENDENTE"}
          </S.StatusBadge>
        </div>
        
        <p style={{marginTop: "5px", color: "#666"}}>{cirurgia.status}</p>
      </S.CardHeader>

      <S.CardDetalhes>
        <p><strong>Data/Hora:</strong> {dataFormatada}</p>
        <p><strong>Duração Estimada:</strong> {cirurgia.duracao_minutos} min</p>
        <p><strong>Sala:</strong> {cirurgia.n_sala === 0 ? "A definir" : `Sala ${cirurgia.n_sala} (${cirurgia.tipo_sala})`}</p>

        {/* 🔥 Aqui alterado para exibir como cirurgias passadas */}
        <p><strong>Médico(s):</strong> {cirurgia.medicos || "Não alocado"}</p>
      </S.CardDetalhes>

    </S.CardContainer>
  );
}


export default function MinhasCirurgias() {
  const [cirurgiasFuturas, setCirurgiasFuturas] = useState([]);
  const [cirurgiasPassadas, setCirurgiasPassadas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Obter os dados do USUÁRIO LOGADO (agora será o PACIENTE)
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  // Assumimos que o objeto do usuário logado tem um campo 'cpf' (que é o CPF do Paciente)
  const cpfPaciente = usuario ? usuario.cpf : ""; 

  // Função para filtrar as cirurgias
  const filtrarCirurgias = (todasCirurgias) => {
    const dataAtual = new Date();
    
    // A função 'getTime()' compara a data da cirurgia com a data atual em milissegundos
    const futuras = todasCirurgias.filter(cirurgia => new Date(cirurgia.data_hora).getTime() >= dataAtual.getTime());
    const passadas = todasCirurgias.filter(cirurgia => new Date(cirurgia.data_hora).getTime() < dataAtual.getTime());

    // Ordenar por data (futuras ascendente, passadas descendente - ou ajuste a ordem conforme preferir)
    futuras.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
    passadas.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

    setCirurgiasFuturas(futuras);
    setCirurgiasPassadas(passadas);
  };

  useEffect(() => {
    async function carregarCirurgias() {
      if (!cpfPaciente) {
          setLoading(false);
          return;
      }

      try {
        // 2. Mudar a URL para buscar cirurgias pelo CPF do PACIENTE
        const resp = await fetch(`http://localhost:5000/paciente/${cpfPaciente}/cirurgias`); 
        
        if (resp.ok) {
          const dados = await resp.json();
          // 3. Chamar a função de filtragem
          filtrarCirurgias(dados); 
        } else {
          console.error("Erro ao buscar cirurgias");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarCirurgias();
  }, [cpfPaciente]); // Dependência atualizada para cpfPaciente

  // Função auxiliar para renderizar a lista de cirurgias
  const renderizarLista = (lista) => (
    lista.length > 0 ? (
      lista.map((cirurgia, index) => (
        <CirurgiaCard key={index} cirurgia={cirurgia} />
      ))
    ) : (
      <p>Nenhuma cirurgia encontrada nesta categoria.</p>
    )
  );

  return (
    <>
      <S.GlobalStyles />
      <S.MinhasCirurgiasContainer>
        <Header />

        <S.MainContent>
          <h1>Minhas Cirurgias</h1>
          <p>Acompanhe o status dos seus procedimentos cirúrgicos.</p>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              {/* --- 4. Renderização das Cirurgias Futuras --- */}
              <h2>🗓️ Cirurgias Futuras ({cirurgiasFuturas.length})</h2>
              <S.CirurgiaList>
                {renderizarLista(cirurgiasFuturas)}
              </S.CirurgiaList>

              <hr style={{margin: "30px 0"}}/>
              
              {/* --- 4. Renderização das Cirurgias Passadas --- */}
              <h2>✅ Cirurgias Passadas ({cirurgiasPassadas.length})</h2>
              <S.CirurgiaList>
                {renderizarLista(cirurgiasPassadas)}
              </S.CirurgiaList>
            </>
          )}
          
        </S.MainContent>

        <Footer />
      </S.MinhasCirurgiasContainer>
    </>
  );
}