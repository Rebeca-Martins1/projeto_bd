import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, Calendar, User, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function HistoricoPacientes() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoAtendimento, setTipoAtendimento] = useState('todos');
  const [faixaEtaria, setFaixaEtaria] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    atendimentosPorEspecialidade: [],
    internacoesAtivas: [],
    procedimentosRealizados: [],
    origemPacientes: [],
    distribuicaoFaixaEtaria: [],
    evolucaoAtendimentos: []
  });

  useEffect(() => {
    fetchDadosPacientes();
  }, [periodo, tipoAtendimento, faixaEtaria]);

  const fetchDadosPacientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/historicopacientes', {
        params: { periodo, tipoAtendimento, faixaEtaria }
      });
      setDados(response.data || {
        metricas: {},
        atendimentosPorEspecialidade: [],
        internacoesAtivas: [],
        procedimentosRealizados: [],
        origemPacientes: [],
        distribuicaoFaixaEtaria: [],
        evolucaoAtendimentos: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados de pacientes:", error);
      alert("Erro ao carregar histórico de pacientes");
      setDados({
        metricas: {},
        atendimentosPorEspecialidade: [],
        internacoesAtivas: [],
        procedimentosRealizados: [],
        origemPacientes: [],
        distribuicaoFaixaEtaria: [],
        evolucaoAtendimentos: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exporthistoricopacientes`, {
        params: { format, periodo, tipoAtendimento, faixaEtaria },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historico-pacientes-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatório");
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 'N/A';
    try {
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      return idade;
    } catch (error) {
      console.error("Erro ao calcular idade:", error);
      return 'N/A';
    }
  };

  const formatarVariacao = (variacao) => {
    if (!variacao) return '0%';
    if (typeof variacao === 'string') return variacao;
    return `${variacao >= 0 ? '+' : ''}${variacao}%`;
  };

  const getStatusAtendimento = (valor) => {
    if (valor >= 20) return 'alto';
    if (valor >= 10) return 'moderado';
    if (valor >= 5) return 'estavel';
    return 'baixo';
  };

  const getStatusPermanencia = (dias) => {
    if (dias >= 30) return 'critico';
    if (dias >= 15) return 'alerta';
    if (dias >= 7) return 'estavel';
    return 'baixo';
  };

  return (
    <>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        <Header />

        <S.MainContent>
          {/* Header da página */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>

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
                Histórico de Pacientes
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado dos atendimentos e métricas de pacientes
              </p>
              {loading && <div style={{ color: '#3b82f6', marginTop: '0.5rem', fontSize: '0.875rem' }}>Carregando dados...</div>}
            </div>
            
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
              
              <label>Tipo de Atendimento:</label>
              <S.Select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value)} disabled={loading}>
                <option value="todos">Todos os Atendimentos</option>
                <option value="consulta">Consultas</option>
                <option value="emergencia">Emergência</option>
                <option value="internacao">Internação</option>
                <option value="cirurgia">Cirurgias</option>
              </S.Select>

              <label>Faixa Etária:</label>
              <S.Select value={faixaEtaria} onChange={(e) => setFaixaEtaria(e.target.value)} disabled={loading}>
                <option value="todas">Todas as Idades</option>
                <option value="criancas">0-12 anos</option>
                <option value="adolescentes">13-17 anos</option>
                <option value="adultos">18-59 anos</option>
                <option value="idosos">60+ anos</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total Atendidos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalAtendidos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendAtendidos || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoAtendidos || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Remarcação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaRemarcacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendRemarcacao || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoRemarcacao || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Consultas remarcadas
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Permanência Média</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.permanenciaMedia || 0} dias</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendPermanencia || 'neutral'}>
                {dados.metricas?.variacaoPermanencia || '0 dias'}
              </S.MetricTrend>
              <S.MetricDetail>
                Internação
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Retorno</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaRetorno || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendRetorno || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoRetorno || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Pacientes recorrentes
              </S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Atendimentos por Especialidade */}
          <S.TableSection>
            <S.TableTitle>Atendimentos por Especialidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : dados.atendimentosPorEspecialidade && dados.atendimentosPorEspecialidade.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Atendimentos</th>
                    <th>Novos Pacientes</th>
                    <th>Retornos</th>
                    <th>Média Idade</th>
                    <th>Taxa Crescimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.atendimentosPorEspecialidade.map((especialidade, index) => {
                    const crescimentoNum = parseFloat(especialidade.taxaCrescimento?.replace(/[^0-9.-]/g, '') || especialidade.taxaCrescimento || 0);
                    return (
                      <tr key={index}>
                        <td>
                          <strong>{especialidade.especialidade || 'Não informado'}</strong>
                        </td>
                        <td>{especialidade.totalAtendimentos || 0}</td>
                        <td>{especialidade.novosPacientes || 0}</td>
                        <td>{especialidade.retornos || 0}</td>
                        <td>{especialidade.mediaIdade || 0} anos</td>
                        <td>
                          <S.PercentValue value={crescimentoNum}>
                            {formatarVariacao(especialidade.taxaCrescimento)}
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusAtendimento(crescimentoNum)}>
                            {getStatusAtendimento(crescimentoNum)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhum atendimento registrado para os filtros selecionados
              </div>
            )}
          </S.TableSection>

          {/* Internações Ativas */}
          <S.TableSection>
            <S.TableTitle>Internações Ativas - Hoje</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : dados.internacoesAtivas && dados.internacoesAtivas.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Idade</th>
                    <th>Setor</th>
                    <th>Diagnóstico</th>
                    <th>Dias Internado</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.internacoesAtivas.map((internacao, index) => (
                    <tr key={index}>
                      <td><strong>{internacao.paciente_nome || 'Não informado'}</strong></td>
                      <td>{calcularIdade(internacao.data_nascimento)} anos</td>
                      <td>
                        {internacao.tipo_leito === 'UTI' ? 
                          <S.UTIBadge>UTI</S.UTIBadge> : 
                          `Enfermaria ${internacao.n_sala || 'N/A'}`
                        }
                      </td>
                      <td>{internacao.diagnostico_principal || 'Em observação'}</td>
                      <td>
                        <S.DuracaoBadge duracao={internacao.dias_internado || 0}>
                          {internacao.dias_internado || 0} dias
                        </S.DuracaoBadge>
                      </td>
                      <td>
                        <S.StatusBadge status={getStatusPermanencia(internacao.dias_internado || 0)}>
                          {getStatusPermanencia(internacao.dias_internado || 0)}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhuma internação ativa para os filtros selecionados
              </div>
            )}
          </S.TableSection>

          {/* Métricas Adicionais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação Leitos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaOcupacaoLeitos || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendOcupacao || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoOcupacao || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Atual
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Altas no Período</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalAltas || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendAltas || 'neutral'}>
                {dados.metricas?.variacaoAltas || '0'}
              </S.MetricTrend>
              <S.MetricDetail>
                Pacientes
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio Espera</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.tempoMedioEspera || 0} min</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendEspera || 'neutral'}>
                {dados.metricas?.variacaoEspera || '0 min'}
              </S.MetricTrend>
              <S.MetricDetail>
                Pronto Socorro
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Satisfação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaSatisfacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendSatisfacao || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoSatisfacao || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Pesquisa pacientes
              </S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}