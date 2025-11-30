import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

export default function AtividadeCirurgica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoCirurgia, setTipoCirurgia] = useState('todas');
  const [especialidade, setEspecialidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    cirurgiasPorEspecialidade: [],
    topCirurgioes: [],
    proximasCirurgias: [],
    evolucaoMensal: []
  });

  useEffect(() => {
    fetchDadosCirurgicos();
  }, [periodo, tipoCirurgia, especialidade]);

  const fetchDadosCirurgicos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/atividade-cirurgica', {
        params: { periodo, tipoCirurgia, especialidade }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados cirúrgicos:", error);
      alert("Erro ao carregar dados da atividade cirúrgica");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-cirurgias`, {
        params: { format, periodo, tipoCirurgia, especialidade },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `atividade-cirurgica-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatório");
    }
  };

  const formatarDuracao = (minutos) => {
    if (!minutos) return '0min';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
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
            <h1>Atividade Cirúrgica</h1>
            <p>Relatório detalhado das cirurgias e procedimentos realizados</p>
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
            
            <label>Tipo de Cirurgia:</label>
            <S.Select value={tipoCirurgia} onChange={(e) => setTipoCirurgia(e.target.value)} disabled={loading}>
              <option value="todas">Todas as Cirurgias</option>
              <option value="eletiva">Eletivas</option>
              <option value="emergencia">Emergência</option>
              <option value="urgente">Urgentes</option>
            </S.Select>

            <label>Especialidade:</label>
            <S.Select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} disabled={loading}>
              <option value="todas">Todas as Especialidades</option>
              <option value="ortopedia">Ortopedia</option>
              <option value="cardiologia">Cardiologia</option>
              <option value="neurologia">Neurologia</option>
              <option value="ginecologia">Ginecologia</option>
              <option value="urologia">Urologia</option>
              <option value="oftalmologia">Oftalmologia</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Cirurgias</S.MetricTitle>
              <S.MetricValue>{dados.metricas.totalCirurgias || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendTotal || 'neutral'}>
                {dados.metricas.variacaoTotal || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Aprovação</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaAprovacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendAprovacao || 'neutral'}>
                {dados.metricas.variacaoAprovacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Cirurgias bem-sucedidas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas.tempoMedio)}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendTempo || 'neutral'}>
                {dados.metricas.variacaoTempo || '0min'}
              </S.MetricTrend>
              <S.MetricDetail>Por cirurgia</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaOcupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendOcupacao || 'neutral'}>
                {dados.metricas.variacaoOcupacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Salas de cirurgia</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Distribuição por Tipo</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Pizza - Eletivas vs Emergência vs Urgentes
                  <S.ChartData>
                    {dados.metricas.distribuicaoTipo?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={item.cor} />
                        {item.tipo}: {item.quantidade} ({item.percentual}%)
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Evolução Mensal</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Linha - Tendência de Cirurgias
                  <S.ChartData>
                    {dados.evolucaoMensal?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        {item.mes}: {item.cirurgias} cirurgias
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela de Cirurgias por Especialidade */}
          <S.TableSection>
            <S.TableTitle>Cirurgias por Especialidade</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Cirurgias</th>
                    <th>Eletivas</th>
                    <th>Emergência</th>
                    <th>Taxa Sucesso</th>
                    <th>Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.cirurgiasPorEspecialidade?.map((especialidade, index) => (
                    <tr key={index}>
                      <td><strong>{especialidade.especialidade}</strong></td>
                      <td>{especialidade.totalCirurgias}</td>
                      <td>{especialidade.eletivas}</td>
                      <td>{especialidade.emergencia}</td>
                      <td>{especialidade.taxaSucesso}%</td>
                      <td>{formatarDuracao(especialidade.tempoMedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Cirurgiões com Maior Volume */}
          <S.TableSection>
            <S.TableTitle>Top Cirurgiões - Maior Volume</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Cirurgião</th>
                    <th>Especialidade</th>
                    <th>Cirurgias</th>
                    <th>Taxa Sucesso</th>
                    <th>Tempo Médio</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.topCirurgioes?.map((cirurgiao, index) => (
                    <tr key={index}>
                      <td><strong>{cirurgiao.nome}</strong></td>
                      <td>{cirurgiao.especialidade}</td>
                      <td>{cirurgiao.totalCirurgias}</td>
                      <td>{cirurgiao.taxaSucesso}%</td>
                      <td>{formatarDuracao(cirurgiao.tempoMedio)}</td>
                      <td>
                        <S.StatusBadge status={cirurgiao.disponivel ? 'ativo' : 'inativo'}>
                          {cirurgiao.disponivel ? 'Ativo' : 'Inativo'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Métricas de Eficiência */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Taxa de Cancelamento</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaCancelamento || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendCancelamento || 'neutral'}>
                {dados.metricas.variacaoCancelamento || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo de Preparação</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas.tempoPreparacao)}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendPreparacao || 'neutral'}>
                {dados.metricas.variacaoPreparacao || '0min'}
              </S.MetricTrend>
              <S.MetricDetail>Médio por cirurgia</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Cirurgias de Emergência</S.MetricTitle>
              <S.MetricValue>{dados.metricas.cirurgiasEmergencia || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendEmergencia || 'neutral'}>
                {dados.metricas.variacaoEmergencia || '0'}
              </S.MetricTrend>
              <S.MetricDetail>{dados.metricas.percentualEmergencia || 0}% do total</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Reintervenções</S.MetricTitle>
              <S.MetricValue>{dados.metricas.reintervencoes || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendReintervencoes || 'neutral'}>
                {dados.metricas.variacaoReintervencoes || '0'}
              </S.MetricTrend>
              <S.MetricDetail>{dados.metricas.percentualReintervencoes || 0}% do total</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Agendamentos Futuros */}
          <S.TableSection>
            <S.TableTitle>Próximas Cirurgias Agendadas</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Paciente</th>
                    <th>Procedimento</th>
                    <th>Cirurgião</th>
                    <th>Sala</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.proximasCirurgias?.map((cirurgia, index) => (
                    <tr key={index}>
                      <td>{new Date(cirurgia.data_hora).toLocaleString('pt-BR')}</td>
                      <td>{cirurgia.paciente_nome}</td>
                      <td>{cirurgia.procedimento}</td>
                      <td>{cirurgia.cirurgiao_nome}</td>
                      <td>{cirurgia.n_sala}</td>
                      <td>
                        <S.StatusBadge status={cirurgia.status === 'agendada' ? 'agendada' : 'confirmada'}>
                          {cirurgia.status === 'agendada' ? 'Agendada' : 'Confirmada'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}