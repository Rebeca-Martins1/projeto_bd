import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

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
      const response = await axios.get('http://localhost:5000/ocupacaosalas', {
        params: { periodo, tipoSala }
      });
      setDados(response.data || {
        metricas: {},
        detalhamentoEspecialidades: [],
        salasCirurgia: [],
        ocupacaoPorTurno: [],
        evolucaoOcupacao: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados de salas:", error);
      alert("Erro ao carregar dados de ocupação de salas");
      setDados({
        metricas: {},
        detalhamentoEspecialidades: [],
        salasCirurgia: [],
        ocupacaoPorTurno: [],
        evolucaoOcupacao: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exportsalas`, {
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

  const getStatusOcupacao = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixa';
  };

  const formatarHorario = (dataHora) => {
    if (!dataHora) return 'N/A';
    try {
      return new Date(dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Horário inválido';
    }
  };

  const getTurnoMaisOcupado = (turnos) => {
    if (!turnos || typeof turnos !== 'object') return 'N/A';
    const turnosArray = Object.entries(turnos);
    if (turnosArray.length === 0) return 'N/A';
    
    const turno = turnosArray.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return turno.charAt(0).toUpperCase() + turno.slice(1);
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
                Ocupação de Salas
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado da utilização das salas hospitalares
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
              
              <label>Tipo de Sala:</label>
              <S.Select value={tipoSala} onChange={(e) => setTipoSala(e.target.value)} disabled={loading}>
                <option value="todas">Todas as Salas</option>
                <option value="CONSULTORIO">Consultórios</option>
                <option value="CIRURGIA">Salas de Cirurgia</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Consultórios</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.consultorios?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.consultorios?.tendencia || 'neutral'}>
                {dados.metricas?.consultorios?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.consultorios?.ocupadas || 0)}/{(dados.metricas?.consultorios?.total || 0)} consultórios ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.consultorios?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.consultorios?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas de Cirurgia</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.cirurgia?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.cirurgia?.tendencia || 'neutral'}>
                {dados.metricas?.cirurgia?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.cirurgia?.ocupadas || 0)}/{(dados.metricas?.cirurgia?.total || 0)} salas ocupadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.cirurgia?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.cirurgia?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Geral</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.total?.tendencia || 'neutral'}>
                {dados.metricas?.total?.variacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>
                {(dados.metricas?.total?.ocupadas || 0)}/{(dados.metricas?.total?.total || 0)} salas ocupadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}>
                {getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Utilização</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaUtilizacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendUtilizacao || 'neutral'}>
                {dados.metricas?.variacaoUtilizacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Horas produtivas/dia</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Dados de Ocupação por Turno em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Ocupação por Turno</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Percentual de ocupação por período do dia
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de turnos...</S.ChartLoading>
            ) : (
              dados.ocupacaoPorTurno && dados.ocupacaoPorTurno.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Percentual de Ocupação</th>
                      <th>Status</th>
                      <th>Salas Ocupadas</th>
                      <th>Salas Totais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.ocupacaoPorTurno.map((turno, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{turno.turno || `Turno ${index + 1}`}</strong>
                        </td>
                        <td>
                          <S.PercentValue value={turno.percentual || 0}>
                            {turno.percentual || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(turno.percentual || 0)}>
                            {getStatusOcupacao(turno.percentual || 0)}
                          </S.StatusBadge>
                        </td>
                        <td>{turno.salas_ocupadas || 0}</td>
                        <td>{turno.salas_totais || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de turnos disponível
                </div>
              )
            )}
          </S.TableSection>

          {/* Dados de Evolução da Ocupação em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Evolução da Ocupação</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Tendência da ocupação ao longo do período
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              dados.evolucaoOcupacao && dados.evolucaoOcupacao.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data/Dia</th>
                      <th>Ocupação Consultórios</th>
                      <th>Ocupação Salas Cirurgia</th>
                      <th>Ocupação Total</th>
                      <th>Status Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.evolucaoOcupacao.slice(0, 8).map((ponto, index) => (
                      <tr key={index}>
                        <td>{ponto.data || ponto.dia || `Dia ${index + 1}`}</td>
                        <td>
                          <S.PercentValue value={ponto.consultorios || 0}>
                            {ponto.consultorios || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.PercentValue value={ponto.cirurgia || 0}>
                            {ponto.cirurgia || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.PercentValue value={ponto.total || 0}>
                            {ponto.total || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(ponto.total || 0)}>
                            {getStatusOcupacao(ponto.total || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de evolução disponível
                </div>
              )
            )}
          </S.TableSection>

          {/* Tabela Detalhada - Especialidades */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Especialidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
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
                  {dados.detalhamentoEspecialidades && dados.detalhamentoEspecialidades.length > 0 ? (
                    dados.detalhamentoEspecialidades.map((especialidade, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{especialidade.especialidade || 'Não informado'}</strong>
                          {especialidade.tipo_sala === 'CIRURGIA' && <S.CirurgiaBadge>CIR</S.CirurgiaBadge>}
                        </td>
                        <td>{especialidade.salas_totais || 0}</td>
                        <td>{especialidade.salas_ocupadas || 0}</td>
                        <td>
                          <S.PercentValue value={especialidade.ocupacao || 0}>
                            {especialidade.ocupacao || 0}%
                          </S.PercentValue>
                        </td>
                        <td>{getTurnoMaisOcupado(especialidade.turnos)}</td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(especialidade.ocupacao || 0)}>
                            {getStatusOcupacao(especialidade.ocupacao || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhuma especialidade disponível para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Tabela Detalhada - Salas de Cirurgia */}
          <S.TableSection>
            <S.TableTitle>Salas de Cirurgia - Agendamentos</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
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
                  {dados.salasCirurgia && dados.salasCirurgia.length > 0 ? (
                    dados.salasCirurgia.map((sala, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{sala.n_sala || 'N/A'}</strong>
                        </td>
                        <td>
                          <S.TipoSala tipo={sala.tipo || 'CONSULTORIO'}>
                            {sala.tipo === 'CIRURGIA' ? 'Cirurgia' : 'Consultório'}
                          </S.TipoSala>
                        </td>
                        <td>{(sala.cirurgias_hoje || 0)}/{(sala.capacidade_diaria || 0)}</td>
                        <td>
                          <S.StatusBadge status={sala.status || 'disponivel'}>
                            {sala.status === 'ocupada' ? 'Ocupada' :
                             sala.status === 'disponivel' ? 'Disponível' :
                             sala.status === 'manutencao' ? 'Manutenção' : 'Livre'}
                          </S.StatusBadge>
                        </td>
                        <td>
                          {sala.proxima_cirurgia ? (
                            <>
                              {formatarHorario(sala.proxima_cirurgia?.data_hora)} - {sala.proxima_cirurgia?.tipo || 'N/A'}
                            </>
                          ) : (
                            'Nenhuma agendada'
                          )}
                        </td>
                        <td>{sala.especialidade_principal || 'Não especificada'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhuma sala de cirurgia disponível para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Estatísticas de Utilização */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Horário de Pico</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.horarioPico || '09:00-11:00'}</S.MetricValue>
              <S.MetricDetail>Manhã</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ociosidade</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaOciosidade || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendOciosidade || 'neutral'}>
                {dados.metricas?.variacaoOciosidade || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Salas não utilizadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Média de Uso Diário</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.mediaUsoDiario || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendUsoDiario || 'neutral'}>
                {dados.metricas?.variacaoUsoDiario || '0h'}
              </S.MetricTrend>
              <S.MetricDetail>Por sala</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas em Manutenção</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.salasManutencao || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendManutencao || 'neutral'}>
                {dados.metricas?.variacaoManutencao || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Fora de operação</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}