import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

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
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/ocupacao-leitos', {
        params: { periodo, unidade }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados de leitos:", error);
      alert("Erro ao carregar dados de ocupação de leitos");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-leitos`, {
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

  const calcularOcupacao = (ocupados, total) => {
    if (!total || total === 0) return 0;
    return Math.round((ocupados / total) * 100);
  };

  const getStatusOcupacao = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixa';
  };

  return (
    <div>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        {/* Header */}
        <S.Header>
          <S.BackButton onClick={() => navigate("/conselhopresidente")}>
            ← Voltar para Painel
          </S.BackButton>
          <S.Title>
            <h1>Ocupação de Leitos</h1>
            <p>Relatório detalhado da ocupação hospitalar</p>
            {loading && <S.LoadingMessage>Carregando dados...</S.LoadingMessage>}
          </S.Title>
          <S.ExportButtons>
            <S.ExportBtn onClick={() => handleExport('pdf')} disabled={loading}>
              Exportar PDF
            </S.ExportBtn>
            <S.ExportBtn onClick={() => handleExport('excel')} disabled={loading}>
              Exportar Excel
            </S.ExportBtn>
          </S.ExportButtons>
        </S.Header>

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

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>UTI</S.MetricTitle>
              <S.MetricValue>{dados.metricas.uti?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.uti?.tendencia || 'neutral'}>
                {dados.metricas.uti?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.uti?.ocupados || 0}/{dados.metricas.uti?.total || 0} leitos ocupados
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.uti?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.uti?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.uti?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.uti?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Enfermaria</S.MetricTitle>
              <S.MetricValue>{dados.metricas.enfermaria?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.enfermaria?.tendencia || 'neutral'}>
                {dados.metricas.enfermaria?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.enfermaria?.ocupados || 0}/{dados.metricas.enfermaria?.total || 0} leitos ocupados
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.enfermaria?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.enfermaria?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.enfermaria?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.enfermaria?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Hospitalar</S.MetricTitle>
              <S.MetricValue>{dados.metricas.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.total?.tendencia || 'neutral'}>
                {dados.metricas.total?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.total?.ocupados || 0}/{dados.metricas.total?.total || 0} leitos ocupados
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.total?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Rotatividade</S.MetricTitle>
              <S.MetricValue>{dados.metricas.rotatividade || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendRotatividade || 'neutral'}>
                {dados.metricas.variacaoRotatividade || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Alta de pacientes/dia</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Tendência de Ocupação</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Linha - Evolução Mensal
                  <S.ChartData>
                    {dados.tendenciaOcupacao?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color="#3b82f6" />
                        {item.data}: UTI {item.uti}% | Enfermaria {item.enfermaria}%
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Distribuição por Unidade</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Pizza - Percentual
                  <S.ChartData>
                    {dados.distribuicaoUnidades?.map((unidade, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={unidade.cor} />
                        {unidade.tipo}: {unidade.percentual}% ({unidade.leitos} leitos)
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela Detalhada */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Setor</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
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
                  {dados.detalhamentoSetores?.map((setor, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{setor.setor}</strong>
                        {setor.tipo === 'UTI' && <S.UTIBadge>UTI</S.UTIBadge>}
                      </td>
                      <td>{setor.leitos_totais}</td>
                      <td>{setor.leitos_ocupados}</td>
                      <td>{setor.leitos_livres}</td>
                      <td>
                        <S.OcupacaoPercentual percentual={setor.ocupacao}>
                          {setor.ocupacao}%
                        </S.OcupacaoPercentual>
                      </td>
                      <td>
                        <S.StatusBadge status={getStatusOcupacao(setor.ocupacao)}>
                          {getStatusOcupacao(setor.ocupacao) === 'critico' ? 'Crítico' :
                           getStatusOcupacao(setor.ocupacao) === 'alerta' ? 'Alerta' :
                           getStatusOcupacao(setor.ocupacao) === 'estavel' ? 'Estável' : 'Baixa'}
                        </S.StatusBadge>
                      </td>
                      <td>
                        <S.TableTrend trend={setor.tendencia}>
                          {setor.tendencia === 'up' ? '+' : ''}{setor.variacao}
                        </S.TableTrend>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Estatísticas Adicionais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Tempo Médio Permanência</S.MetricTitle>
              <S.MetricValue>{dados.metricas.tempoMedioPermanencia || 0}d</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendPermanencia || 'neutral'}>
                {dados.metricas.variacaoPermanencia || '0d'}
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
              <S.MetricValue>{dados.metricas.leitosBloqueados || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendBloqueados || 'neutral'}>
                {dados.metricas.variacaoBloqueados || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Para manutenção</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Previsão Alta</S.MetricTitle>
              <S.MetricValue>{dados.metricas.previsaoAltas || 0}</S.MetricValue>
              <S.MetricDetail>Próximas 24h</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}