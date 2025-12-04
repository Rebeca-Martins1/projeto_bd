import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function AtividadeCirurgica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    desempenhoEspecialidades: [],
    topCirurgioes: [],
    evolucaoCirurgias: [],
    distribuicaoTipoCirurgia: []
  });

  useEffect(() => {
    fetchDadosCirurgicos();
  }, [periodo]);

  const fetchDadosCirurgicos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/atividadecirurgica', {
        params: { periodo }
      });
      setDados(response.data || {
        metricas: {},
        desempenhoEspecialidades: [],
        topCirurgioes: [],
        evolucaoCirurgias: [],
        distribuicaoTipoCirurgia: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados cirúrgicos:", error);
      alert("Erro ao carregar dados da atividade cirúrgica");
      setDados({
        metricas: {},
        desempenhoEspecialidades: [],
        topCirurgioes: [],
        evolucaoCirurgias: [],
        distribuicaoTipoCirurgia: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exportatividadecirurgica`, {
        params: { format, periodo },
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

  const getStatusDuracao = (minutos) => {
    if (minutos > 240) return 'critico'; // > 4h
    if (minutos > 120) return 'alerta'; // > 2h
    if (minutos > 60) return 'estavel'; // > 1h
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
                Atividade Cirúrgica
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado das cirurgias realizadas
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

          {/* Filtros - APENAS PERÍODO */}
          <S.FilterSection>
            <S.FilterGroup>
              <label>Período:</label>
              <S.Select value={periodo} onChange={(e) => setPeriodo(e.target.value)} disabled={loading}>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="trimestre">Último Trimestre</option>
                <option value="ano">Último Ano</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Cirurgias</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalCirurgias || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendCirurgias || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoCirurgias || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período vs anterior
              </S.MetricDetail>
              <S.StatusBadge status={getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}>
                {getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Duração Média</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas?.duracaoMedia)}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendDuracao || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoDuracao || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Por cirurgia
              </S.MetricDetail>
              <S.StatusBadge status={getStatusDuracao(dados.metricas?.duracaoMedia || 0)}>
                {getStatusDuracao(dados.metricas?.duracaoMedia || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação Salas</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaOcupacaoSalas || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendOcupacao || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoOcupacao || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Salas de cirurgia
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Cirurgiões Ativos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.cirurgioesAtivos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendCirurgioes || 'neutral'}>
                {formatarPercentual(dados.metricas?.variacaoCirurgioes || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Dados de Evolução de Cirurgias em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Evolução de Cirurgias</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Tendência ao longo do período
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              dados.evolucaoCirurgias && dados.evolucaoCirurgias.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data/Dia</th>
                      <th>Cirurgias Eletivas</th>
                      <th>Cirurgias de Emergência</th>
                      <th>Cirurgias de Urgência</th>
                      <th>Total de Cirurgias</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.evolucaoCirurgias.slice(0, 8).map((ponto, index) => (
                      <tr key={index}>
                        <td>{ponto.data || ponto.dia || `Dia ${index + 1}`}</td>
                        <td>{ponto.eletiva || 0}</td>
                        <td>{ponto.emergencia || 0}</td>
                        <td>{ponto.urgencia || 0}</td>
                        <td>{(ponto.eletiva || 0) + (ponto.emergencia || 0) + (ponto.urgencia || 0)}</td>
                        <td>
                          <S.StatusBadge status={getStatusEficiencia(ponto.taxa_crescimento || 0)}>
                            {getStatusEficiencia(ponto.taxa_crescimento || 0)}
                          </S.StatusBadge>
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

          {/* Dados de Distribuição por Tipo de Cirurgia em formato tabular */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Tipo de Cirurgia</S.TableTitle>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Tipos de cirurgias realizadas
            </div>
            {loading ? (
              <S.ChartLoading>Carregando dados de distribuição...</S.ChartLoading>
            ) : (
              (dados.distribuicaoTipoCirurgia && dados.distribuicaoTipoCirurgia.length > 0) ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Tipo de Cirurgia</th>
                      <th>Percentual</th>
                      <th>Quantidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.distribuicaoTipoCirurgia.map((tipo, index) => (
                      <tr key={index}>
                        <td>
                          <strong>
                            {tipo.tipo === 'ELETIVA' ? 'Cirurgia Eletiva' :
                             tipo.tipo === 'EMERGENCIA' ? 'Cirurgia de Emergência' :
                             tipo.tipo === 'URGENCIA' ? 'Cirurgia de Urgência' :
                             tipo.tipo || `Tipo ${index + 1}`}
                          </strong>
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

          {/* Tabela de Especialidades Cirúrgicas */}
          <S.TableSection>
            <S.TableTitle>Desempenho por Especialidade Cirúrgica</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Cirurgias</th>
                    <th>Duração Média</th>
                    <th>Taxa de Emergência</th>
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
                          {especialidade.taxaEmergencia > 30 && <S.EmergenciaBadge>ALTA EMERG</S.EmergenciaBadge>}
                        </td>
                        <td>{especialidade.totalCirurgias || 0}</td>
                        <td>
                          <S.DuracaoBadge duracao={especialidade.duracaoMedia || 0}>
                            {formatarDuracao(especialidade.duracaoMedia)}
                          </S.DuracaoBadge>
                        </td>
                        <td>{especialidade.taxaEmergencia || 0}%</td>
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
                        Nenhum dado disponível para o período selecionado
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