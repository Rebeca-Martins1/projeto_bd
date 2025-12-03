import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function OcupacaoLeitos() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [unidade, setUnidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    detalhamentoSetores: [],
    tendenciaOcupacao: [],
    distribuicaoUnidades: []
  });

  useEffect(() => {
    fetchDadosLeitos();
  }, [periodo, unidade]);

  const fetchDadosLeitos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/ocupacaoleitos', {
        params: { periodo, unidade }
      });
      setDados(response.data || {
        metricas: {},
        detalhamentoSetores: [],
        tendenciaOcupacao: [],
        distribuicaoUnidades: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados de leitos:", error);
      alert("Erro ao carregar dados de ocupação de leitos");
      setDados({
        metricas: {},
        detalhamentoSetores: [],
        tendenciaOcupacao: [],
        distribuicaoUnidades: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exportleitos`, {
        params: { format, periodo, unidade },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ocupacao-leitos-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatório");
    }
  };

  const getStatusOcupacao = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixa';
  };

  return (
    <>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        <Header />

        <S.MainContent>
          {/* Header da página - TÍTULO CENTRALIZADO E EXPORTAR À DIREITA */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Botão Voltar à esquerda */}
            <S.BackButton onClick={() => navigate("/conselhopresidente")} style={{ alignSelf: 'center' }}>
              <ArrowLeft size={16} />
              Voltar para Painel
            </S.BackButton>
            
            {/* Título centralizado */}
            <div style={{ 
              textAlign: 'center',
              flex: 1,
              minWidth: '300px'
            }}>
              <h1 style={{ 
                fontSize: '1.875rem', 
                fontWeight: '700', 
                color: '#1f2937',
                margin: '0 0 0.25rem 0'
              }}>
                Ocupação de Leitos
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado da ocupação hospitalar
              </p>
              {loading && <div style={{ color: '#3b82f6', marginTop: '0.5rem', fontSize: '0.875rem' }}>Carregando dados...</div>}
            </div>
            
            {/* Botões de exportar à direita */}
            <S.ExportButtons style={{ alignSelf: 'center' }}>
              <S.ExportBtn onClick={() => handleExport('pdf')} disabled={loading}>
                <FileText size={16} />
                Exportar PDF
              </S.ExportBtn>
              <S.ExportBtn onClick={() => handleExport('excel')} disabled={loading}>
                <Download size={16} />
                Exportar Excel
              </S.ExportBtn>
            </S.ExportButtons>
          </div>

          {/* Filtros */}
          <S.FilterSection>
            <S.FilterGroup>
              <label>Período:</label>
              <S.Select value={periodo} onChange={(e) => setPeriodo(e.target.value)} disabled={loading}>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="trimestre">Último Trimestre</option>
                <option value="ano">Último Ano</option>
              </S.Select>
              
              <label>Unidade:</label>
              <S.Select value={unidade} onChange={(e) => setUnidade(e.target.value)} disabled={loading}>
                <option value="todas">Todas as Unidades</option>
                <option value="UTI">UTI</option>
                <option value="ENFERMARIA">Enfermaria</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>UTI</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.uti?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.uti?.tendencia || 'neutral'}>
                {dados.metricas?.uti?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.uti?.ocupados || 0)}/{(dados.metricas?.uti?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.uti?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.uti?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Enfermaria</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.enfermaria?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.enfermaria?.tendencia || 'neutral'}>
                {dados.metricas?.enfermaria?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.enfermaria?.ocupados || 0)}/{(dados.metricas?.enfermaria?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.enfermaria?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.enfermaria?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Hospitalar</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.total?.tendencia || 'neutral'}>
                {dados.metricas?.total?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.total?.ocupados || 0)}/{(dados.metricas?.total?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Rotatividade</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.rotatividade || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendRotatividade || 'neutral'}>
                {dados.metricas?.variacaoRotatividade || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Alta de pacientes/dia</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Dados de Tendência de Ocupação em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Tendência de Ocupação</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Evolução ao longo do período
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de tendência...</S.ChartLoading>
            ) : (
              dados.tendenciaOcupacao && dados.tendenciaOcupacao.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data/Dia</th>
                      <th>Ocupação UTI</th>
                      <th>Ocupação Enfermaria</th>
                      <th>Status UTI</th>
                      <th>Status Enfermaria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.tendenciaOcupacao.slice(0, 8).map((ponto, index) => (
                      <tr key={index}>
                        <td>{ponto.data || ponto.dia || `Dia ${index + 1}`}</td>
                        <td>
                          <S.PercentValue value={ponto.uti || 0}>
                            {ponto.uti || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.PercentValue value={ponto.enfermaria || 0}>
                            {ponto.enfermaria || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(ponto.uti || 0)}>
                            {getStatusOcupacao(ponto.uti || 0)}
                          </S.StatusBadge>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(ponto.enfermaria || 0)}>
                            {getStatusOcupacao(ponto.enfermaria || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de tendência disponível para o período selecionado
                </div>
              )
            )}
          </S.TableSection>

          {/* Dados de Distribuição por Unidade em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Unidade</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Percentual de ocupação por tipo de leito
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de distribuição...</S.ChartLoading>
            ) : (
              (dados.distribuicaoUnidades && dados.distribuicaoUnidades.length > 0) ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Tipo de Leito</th>
                      <th>Percentual de Ocupação</th>
                      <th>Leitos Ocupados</th>
                      <th>Leitos Totais</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.distribuicaoUnidades.map((unidade, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{unidade.tipo || `Setor ${index + 1}`}</strong>
                          {unidade.tipo?.includes('UTI') && <S.UTIBadge>UTI</S.UTIBadge>}
                        </td>
                        <td>
                          <S.PercentValue value={unidade.percentual || 0}>
                            {unidade.percentual || 0}%
                          </S.PercentValue>
                        </td>
                        <td>{unidade.leitosOcupados || unidade.leitos || 0}</td>
                        <td>{unidade.leitosTotais || (unidade.leitos || 0) + 5}</td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(unidade.percentual || 0)}>
                            {getStatusOcupacao(unidade.percentual || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de distribuição disponível
                </div>
              )
            )}
          </S.TableSection>

          {/* Detalhamento por Setor */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Setor</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Leitos Totais</th>
                    <th>Leitos Ocupados</th>
                    <th>Leitos Livres</th>
                    <th>Ocupação</th>
                    <th>Status</th>
                    <th>Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.detalhamentoSetores && dados.detalhamentoSetores.length > 0 ? (
                    dados.detalhamentoSetores.map((setor, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{setor.setor || 'Não informado'}</strong>
                          {setor.tipo === 'UTI' && <S.UTIBadge>UTI</S.UTIBadge>}
                        </td>
                        <td>{setor.leitos_totais || 0}</td>
                        <td>{setor.leitos_ocupados || 0}</td>
                        <td>{setor.leitos_livres || 0}</td>
                        <td>
                          <S.PercentValue value={setor.ocupacao || 0}>
                            {setor.ocupacao || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(setor.ocupacao || 0)}>
                            {getStatusOcupacao(setor.ocupacao || 0)}
                          </S.StatusBadge>
                        </td>
                        <td>
                          <S.MetricTrend trend={setor.tendencia || 'neutral'}>
                            {setor.tendencia === 'up' ? '+' : ''}{setor.variacao || '0%'}
                          </S.MetricTrend>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhum dado disponível para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Métricas Adicionais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Tempo Médio Permanência</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.tempoMedioPermanencia || 0}d</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendPermanencia || 'neutral'}>
                {dados.metricas?.variacaoPermanencia || '0d'}
              </S.MetricTrend>
              <S.MetricDetail>Média por paciente</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação Ideal</S.MetricTitle>
              <S.MetricValue>85%</S.MetricValue>
              <S.MetricDetail>Meta do hospital</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Leitos Bloqueados</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.leitosBloqueados || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendBloqueados || 'neutral'}>
                {dados.metricas?.variacaoBloqueados || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Para manutenção</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Previsão Alta</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.previsaoAltas || 0}</S.MetricValue>
              <S.MetricDetail>Próximas 24h</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}