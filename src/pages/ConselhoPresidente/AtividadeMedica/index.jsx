import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function AtividadeMedica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [especialidade, setEspecialidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [especialidadesLista, setEspecialidadesLista] = useState([]);
  const [dados, setDados] = useState({
    metricas: {},
    desempenhoEspecialidades: [],
    topMedicos: [],
    evolucaoConsultas: [],
    distribuicaoTipoConsulta: []
  });

  const fetchEspecialidades = async () => {
    try {
      setLoadingEspecialidades(true);
      const response = await axios.get('http://localhost:5000/especialidades');
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setEspecialidadesLista(response.data);
        } else if (response.data.especialidades && Array.isArray(response.data.especialidades)) {
          setEspecialidadesLista(response.data.especialidades);
        } else if (response.data.nomes && Array.isArray(response.data.nomes)) {
          setEspecialidadesLista(response.data.nomes);
        } else {
          const arrays = Object.values(response.data).filter(Array.isArray);
          if (arrays.length > 0) {
            setEspecialidadesLista(arrays[0]);
          } else {
            throw new Error("Formato de dados não reconhecido");
          }
        }
      }
    } catch (error) {
      console.warn("Endpoint /especialidades não encontrado, tentando buscar do endpoint de atividade médica:", error);
      
      try {
        const atividadeResponse = await axios.get('http://localhost:5000/atividademedica', {
          params: { periodo: 'mes', especialidade: 'todas' }
        });
        
        if (atividadeResponse.data?.desempenhoEspecialidades) {
          const especialidadesUnicas = [
            ...new Set(
              atividadeResponse.data.desempenhoEspecialidades
                .filter(e => e.especialidade && e.especialidade.trim() !== '')
                .map(e => e.especialidade)
            )
          ];
          setEspecialidadesLista(especialidadesUnicas);
        } else {
          const especialidadesPadrao = [
            'Cardiologia',
            'Ortopedia', 
            'Pediatria',
            'Dermatologia',
            'Neurologia',
            'Ginecologia',
            'Oftalmologia',
            'Urologia'
          ];
          setEspecialidadesLista(especialidadesPadrao);
        }
      } catch (error2) {
        console.error("Não foi possível carregar especialidades:", error2);
        const especialidadesPadrao = [
          'Cardiologia',
          'Ortopedia', 
          'Pediatria',
          'Dermatologia',
          'Neurologia',
          'Ginecologia',
          'Oftalmologia',
          'Urologia'
        ];
        setEspecialidadesLista(especialidadesPadrao);
      }
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  useEffect(() => {
    fetchDadosMedicos();
  }, [periodo, especialidade]);

  const fetchDadosMedicos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/atividademedica', {
        params: { periodo, especialidade }
      });
      setDados(response.data || {
        metricas: {},
        desempenhoEspecialidades: [],
        topMedicos: [],
        evolucaoConsultas: [],
        distribuicaoTipoConsulta: []
      });
      
      if (response.data?.desempenhoEspecialidades && (especialidadesLista.length === 0 || especialidadesLista.length < 3)) {
        const especialidadesDoDados = [
          ...new Set(
            response.data.desempenhoEspecialidades
              .filter(e => e.especialidade && e.especialidade.trim() !== '')
              .map(e => e.especialidade)
          )
        ];
        const listaUnificada = [...new Set([...especialidadesLista, ...especialidadesDoDados])];
        if (listaUnificada.length > especialidadesLista.length) {
          setEspecialidadesLista(listaUnificada);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados médicos:", error);
      alert("Erro ao carregar dados da atividade médica");
      setDados({
        metricas: {},
        desempenhoEspecialidades: [],
        topMedicos: [],
        evolucaoConsultas: [],
        distribuicaoTipoConsulta: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exportatividademedica`, {
        params: { format, periodo, especialidade },
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
    if (!minutos) return '0 min';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const getStatusEficiencia = (valor) => {
    if (valor >= 90) return 'alto';
    if (valor >= 80) return 'moderado';
    if (valor >= 70) return 'estavel';
    return 'baixo';
  };

  const formatarPercentual = (valor) => {
    return `${valor >= 0 ? '+' : ''}${valor}%`;
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
                Atividade Médica
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado das consultas e atendimentos médicos
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
              
              <label>Especialidade:</label>
              <S.Select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} disabled={loading}>
                <option value="todas">Todas as Especialidades</option>
                {loadingEspecialidades ? (
                  <option disabled>Carregando especialidades...</option>
                ) : especialidadesLista.length > 0 ? (
                  especialidadesLista.map((esp, index) => (
                    <option key={index} value={esp}>
                      {esp}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Ortopedia">Ortopedia</option>
                    <option value="Pediatria">Pediatria</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Neurologia">Neurologia</option>
                    <option value="Ginecologia">Ginecologia</option>
                  </>
                )}
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Consultas</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalConsultas || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendConsultas || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoConsultas || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período vs anterior
              </S.MetricDetail>
              <S.StatusBadge status={getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}>
                {getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas?.tempoMedio)}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendTempo || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoTempo || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Por consulta
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Comparecimento</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaComparecimento || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendComparecimento || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoComparecimento || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Consultas realizadas
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Médicos Ativos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.medicosAtivos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendMedicos || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoMedicos || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Dados de Evolução de Consultas em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Evolução de Consultas</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Tendência ao longo do período
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              dados.evolucaoConsultas && dados.evolucaoConsultas.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data/Dia</th>
                      <th>Consultas Primeira Vez</th>
                      <th>Consultas de Retorno</th>
                      <th>Total de Consultas</th>
                      <th>Taxa de Crescimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.evolucaoConsultas.slice(0, 8).map((ponto, index) => (
                      <tr key={index}>
                        <td>{ponto.data || ponto.dia || `Dia ${index + 1}`}</td>
                        <td>{ponto.primeira_vez || 0}</td>
                        <td>{ponto.retorno || 0}</td>
                        <td>{(ponto.primeira_vez || 0) + (ponto.retorno || 0)}</td>
                        <td>
                          <S.PercentValue value={ponto.taxa_crescimento || 0}>
                            {ponto.taxa_crescimento || 0}%
                          </S.PercentValue>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de evolução disponível para o período selecionado
                </div>
              )
            )}
          </S.TableSection>

          {/* Dados de Distribuição por Tipo de Consulta em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Tipo de Consulta</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Tipos de consultas realizadas
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de distribuição...</S.ChartLoading>
            ) : (
              (dados.distribuicaoTipoConsulta && dados.distribuicaoTipoConsulta.length > 0) ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Tipo de Consulta</th>
                      <th>Percentual</th>
                      <th>Quantidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.distribuicaoTipoConsulta.map((tipo, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{tipo.tipo || `Tipo ${index + 1}`}</strong>
                        </td>
                        <td>
                          <S.PercentValue value={tipo.percentual || 0}>
                            {tipo.percentual || 0}%
                          </S.PercentValue>
                        </td>
                        <td>{tipo.quantidade || 0}</td>
                        <td>
                          <S.StatusBadge status={getStatusEficiencia(tipo.percentual || 0)}>
                            {getStatusEficiencia(tipo.percentual || 0)}
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

          {/* Tabela de Especialidades */}
          <S.TableSection>
            <S.TableTitle>Desempenho por Especialidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Consultas</th>
                    <th>Tempo Médio</th>
                    <th>Taxa Comparecimento</th>
                    <th>Eficiência</th>
                    <th>Status</th>
                    <th>Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.desempenhoEspecialidades && dados.desempenhoEspecialidades.length > 0 ? (
                    dados.desempenhoEspecialidades.map((especialidade, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{especialidade.especialidade || 'Não informado'}</strong>
                          {especialidade.tipo === 'CIRURGIA' && <S.EspecialidadeBadge>CIR</S.EspecialidadeBadge>}
                        </td>
                        <td>{especialidade.totalConsultas || 0}</td>
                        <td>{formatarDuracao(especialidade.tempoMedio)}</td>
                        <td>{especialidade.taxaComparecimento || 0}%</td>
                        <td>
                          <S.PercentValue value={especialidade.eficiencia || 0}>
                            {especialidade.eficiencia || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusEficiencia(especialidade.eficiencia || 0)}>
                            {getStatusEficiencia(especialidade.eficiencia || 0)}
                          </S.StatusBadge>
                        </td>
                        <td>
                          <S.MetricTrend trend={especialidade.tendencia || 'neutral'}>
                            {especialidade.tendencia === 'up' ? '+' : ''}{especialidade.variacao || '0%'}
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
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}