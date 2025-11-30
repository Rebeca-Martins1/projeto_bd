import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

export default function OcupacaoSalas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoSala, setTipoSala] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    detalhamentoEspecialidades: [],
    salasCirurgia: [],
    ocupacaoPorTurno: [],
    evolucaoOcupacao: []
  });

  useEffect(() => {
    fetchDadosSalas();
  }, [periodo, tipoSala]);

  const fetchDadosSalas = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/ocupacao-salas', {
        params: { periodo, tipoSala }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados de salas:", error);
      alert("Erro ao carregar dados de ocupação de salas");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-salas`, {
        params: { format, periodo, tipoSala },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ocupacao-salas-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatório");
    }
  };

  const calcularOcupacao = (ocupadas, total) => {
    if (!total || total === 0) return 0;
    return Math.round((ocupadas / total) * 100);
  };

  const getStatusOcupacao = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixa';
  };

  const formatarHorario = (dataHora) => {
    if (!dataHora) return 'N/A';
    return new Date(dataHora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTurnoMaisOcupado = (turnos) => {
    if (!turnos) return 'N/A';
    const turno = Object.keys(turnos).reduce((a, b) => turnos[a] > turnos[b] ? a : b);
    return turno.charAt(0).toUpperCase() + turno.slice(1);
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
            <h1>Ocupação de Salas</h1>
            <p>Relatório detalhado da utilização das salas hospitalares</p>
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
            
            <label>Tipo de Sala:</label>
            <S.Select value={tipoSala} onChange={(e) => setTipoSala(e.target.value)} disabled={loading}>
              <option value="todas">Todas as Salas</option>
              <option value="CONSULTORIO">Consultórios</option>
              <option value="CIRURGIA">Salas de Cirurgia</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Consultórios</S.MetricTitle>
              <S.MetricValue>{dados.metricas.consultorios?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.consultorios?.tendencia || 'neutral'}>
                {dados.metricas.consultorios?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.consultorios?.ocupadas || 0}/{dados.metricas.consultorios?.total || 0} consultórios ocupados
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.consultorios?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.consultorios?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.consultorios?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.consultorios?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas de Cirurgia</S.MetricTitle>
              <S.MetricValue>{dados.metricas.cirurgia?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.cirurgia?.tendencia || 'neutral'}>
                {dados.metricas.cirurgia?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.cirurgia?.ocupadas || 0}/{dados.metricas.cirurgia?.total || 0} salas ocupadas
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.cirurgia?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.cirurgia?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.cirurgia?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.cirurgia?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Geral</S.MetricTitle>
              <S.MetricValue>{dados.metricas.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.total?.tendencia || 'neutral'}>
                {dados.metricas.total?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {dados.metricas.total?.ocupadas || 0}/{dados.metricas.total?.total || 0} salas ocupadas
              </S.MetricDetail>
              <S.OcupacaoStatus status={getStatusOcupacao(dados.metricas.total?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'critico' ? 'Crítico' :
                 getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'alerta' ? 'Alerta' :
                 getStatusOcupacao(dados.metricas.total?.ocupacao || 0) === 'estavel' ? 'Estável' : 'Baixa'}
              </S.OcupacaoStatus>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Utilização</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaUtilizacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendUtilizacao || 'neutral'}>
                {dados.metricas.variacaoUtilizacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Horas produtivas/dia</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Ocupação por Especialidade</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Barras - Comparativo por Especialidade
                  <S.ChartData>
                    {dados.detalhamentoEspecialidades?.slice(0, 6).map((especialidade, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={especialidade.cor} />
                        {especialidade.especialidade}: {especialidade.ocupacao}%
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Distribuição por Turno</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Pizza - Manhã vs Tarde vs Noite
                  <S.ChartData>
                    {dados.ocupacaoPorTurno?.map((turno, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={turno.cor} />
                        {turno.turno}: {turno.percentual}%
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela Detalhada */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Especialidade</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Salas Totais</th>
                    <th>Salas Ocupadas</th>
                    <th>Ocupação</th>
                    <th>Turno Mais Ocupado</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.detalhamentoEspecialidades?.map((especialidade, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{especialidade.especialidade}</strong>
                        {especialidade.tipo_sala === 'CIRURGIA' && <S.CirurgiaBadge>CIR</S.CirurgiaBadge>}
                      </td>
                      <td>{especialidade.salas_totais}</td>
                      <td>{especialidade.salas_ocupadas}</td>
                      <td>
                        <S.OcupacaoPercentual percentual={especialidade.ocupacao}>
                          {especialidade.ocupacao}%
                        </S.OcupacaoPercentual>
                      </td>
                      <td>{getTurnoMaisOcupado(especialidade.turnos)}</td>
                      <td>
                        <S.StatusBadge status={getStatusOcupacao(especialidade.ocupacao)}>
                          {getStatusOcupacao(especialidade.ocupacao) === 'critico' ? 'Crítico' :
                           getStatusOcupacao(especialidade.ocupacao) === 'alerta' ? 'Alerta' :
                           getStatusOcupacao(especialidade.ocupacao) === 'estavel' ? 'Estável' : 'Baixa'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Salas de Cirurgia */}
          <S.TableSection>
            <S.TableTitle>Salas de Cirurgia - Agendamentos</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Tipo</th>
                    <th>Cirurgias Hoje</th>
                    <th>Status</th>
                    <th>Próxima Cirurgia</th>
                    <th>Especialidade</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.salasCirurgia?.map((sala, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{sala.n_sala}</strong>
                      </td>
                      <td>
                        <S.TipoSala tipo={sala.tipo}>
                          {sala.tipo === 'CIRURGIA' ? 'Cirurgia' : 'Consultório'}
                        </S.TipoSala>
                      </td>
                      <td>{sala.cirurgias_hoje}/{sala.capacidade_diaria}</td>
                      <td>
                        <S.StatusBadge status={sala.status}>
                          {sala.status === 'ocupada' ? 'Ocupada' :
                           sala.status === 'disponivel' ? 'Disponível' :
                           sala.status === 'manutencao' ? 'Manutenção' : 'Livre'}
                        </S.StatusBadge>
                      </td>
                      <td>
                        {sala.proxima_cirurgia ? (
                          <>
                            {formatarHorario(sala.proxima_cirurgia.data_hora)} - {sala.proxima_cirurgia.tipo}
                          </>
                        ) : (
                          'Nenhuma agendada'
                        )}
                      </td>
                      <td>{sala.especialidade_principal}</td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Estatísticas de Utilização */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Horário de Pico</S.MetricTitle>
              <S.MetricValue>{dados.metricas.horarioPico || '09:00-11:00'}</S.MetricValue>
              <S.MetricDetail>Manhã</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ociosidade</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaOciosidade || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendOciosidade || 'neutral'}>
                {dados.metricas.variacaoOciosidade || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Salas não utilizadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Média de Uso Diário</S.MetricTitle>
              <S.MetricValue>{dados.metricas.mediaUsoDiario || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendUsoDiario || 'neutral'}>
                {dados.metricas.variacaoUsoDiario || '0h'}
              </S.MetricTrend>
              <S.MetricDetail>Por sala</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas em Manutenção</S.MetricTitle>
              <S.MetricValue>{dados.metricas.salasManutencao || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendManutencao || 'neutral'}>
                {dados.metricas.variacaoManutencao || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Fora de operação</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}