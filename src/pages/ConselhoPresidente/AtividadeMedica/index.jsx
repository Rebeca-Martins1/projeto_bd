import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

export default function AtividadeMedica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [especialidade, setEspecialidade] = useState('todas');
  const [medico, setMedico] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    especialidades: [],
    topMedicos: [],
    evolucaoMensal: []
  });

  useEffect(() => {
    fetchDadosMedicos();
  }, [periodo, especialidade, medico]);

  const fetchDadosMedicos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/atividade-medica', {
        params: { periodo, especialidade, medico }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados médicos:", error);
      alert("Erro ao carregar dados da atividade médica");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-consultas`, {
        params: { format, periodo, especialidade, medico },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `atividade-medica-${periodo}.${format}`);
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
    return `${minutos} min`;
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
            <h1>Atividade Médica</h1>
            <p>Relatório detalhado das consultas e atendimentos médicos</p>
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
            
            <label>Especialidade:</label>
            <S.Select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} disabled={loading}>
              <option value="todas">Todas as Especialidades</option>
              {dados.especialidades?.map((esp, index) => (
                <option key={index} value={esp.especialidade}>
                  {esp.especialidade}
                </option>
              ))}
            </S.Select>

            <label>Médico:</label>
            <S.Select value={medico} onChange={(e) => setMedico(e.target.value)} disabled={loading}>
              <option value="todos">Todos os Médicos</option>
              {dados.topMedicos?.map((med, index) => (
                <option key={index} value={med.cpf}>
                  {med.nome}
                </option>
              ))}
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Consultas</S.MetricTitle>
              <S.MetricValue>{dados.metricas.totalConsultas || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendConsultas || 'neutral'}>
                {dados.metricas.variacaoConsultas || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período vs anterior</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas.tempoMedio)}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendTempo || 'neutral'}>
                {dados.metricas.variacaoTempo || '0min'}
              </S.MetricTrend>
              <S.MetricDetail>Por consulta</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Comparecimento</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaComparecimento || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendComparecimento || 'neutral'}>
                {dados.metricas.variacaoComparecimento || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Consultas realizadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Médicos Ativos</S.MetricTitle>
              <S.MetricValue>{dados.metricas.medicosAtivos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendMedicos || 'neutral'}>
                {dados.metricas.variacaoMedicos || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Consultas por Especialidade</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Pizza - Especialidades Mais Requisitadas
                  <S.ChartData>
                    {dados.especialidades?.slice(0, 5).map((esp, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={esp.cor} />
                        {esp.especialidade}: {esp.totalConsultas} ({esp.percentual}%)
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
                  Gráfico de Linha - Tendência de Consultas
                  <S.ChartData>
                    {dados.evolucaoMensal?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        {item.mes}: {item.consultas} consultas
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela de Especialidades */}
          <S.TableSection>
            <S.TableTitle>Desempenho por Especialidade</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Consultas</th>
                    <th>Tempo Médio</th>
                    <th>Taxa Comparecimento</th>
                    <th>Crescimento</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.especialidades?.map((esp, index) => (
                    <tr key={index}>
                      <td><strong>{esp.especialidade}</strong></td>
                      <td>{esp.totalConsultas}</td>
                      <td>{formatarDuracao(esp.tempoMedio)}</td>
                      <td>{esp.taxaComparecimento}%</td>
                      <td>
                        <S.TrendBadge trend={esp.crescimento >= 0 ? 'up' : 'down'}>
                          {esp.crescimento >= 0 ? '+' : ''}{esp.crescimento}%
                        </S.TrendBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Top Médicos */}
          <S.TableSection>
            <S.TableTitle>Top Médicos - Maior Volume</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Médico</th>
                    <th>Especialidade</th>
                    <th>Consultas</th>
                    <th>Tempo Médio</th>
                    <th>Eficiência</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.topMedicos?.map((medico, index) => (
                    <tr key={index}>
                      <td><strong>{medico.nome}</strong></td>
                      <td>{medico.especialidade}</td>
                      <td>{medico.totalConsultas}</td>
                      <td>{formatarDuracao(medico.tempoMedio)}</td>
                      <td>
                        <S.EfficiencyBadge eficiencia={medico.eficiencia}>
                          {medico.eficiencia}%
                        </S.EfficiencyBadge>
                      </td>
                      <td>
                        <S.StatusBadge status={medico.disponivel ? 'ativo' : 'inativo'}>
                          {medico.disponivel ? 'Ativo' : 'Inativo'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Métricas de Tempo */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Horário de Pico</S.MetricTitle>
              <S.MetricValue>{dados.metricas.horarioPico || '09:00 - 11:00'}</S.MetricValue>
              <S.MetricDetail>{dados.metricas.periodoPico || 'Manhã'}</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Remarcação</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaRemarcacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendRemarcacao || 'neutral'}>
                {dados.metricas.variacaoRemarcacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Consultas de Retorno</S.MetricTitle>
              <S.MetricValue>{dados.metricas.consultasRetorno || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendRetorno || 'neutral'}>
                {dados.metricas.variacaoRetorno || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Do total</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Novos Pacientes</S.MetricTitle>
              <S.MetricValue>{dados.metricas.novosPacientes || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendNovosPacientes || 'neutral'}>
                {dados.metricas.variacaoNovosPacientes || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}