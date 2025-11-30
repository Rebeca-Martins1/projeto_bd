import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

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
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/historico-pacientes', {
        params: { periodo, tipoAtendimento, faixaEtaria }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados de pacientes:", error);
      alert("Erro ao carregar histórico de pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-pacientes`, {
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
    if (!dataNascimento) return 0;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getFaixaEtaria = (idade) => {
    if (idade <= 12) return 'criancas';
    if (idade <= 17) return 'adolescentes';
    if (idade <= 59) return 'adultos';
    return 'idosos';
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
            <h1>Histórico de Pacientes</h1>
            <p>Relatório detalhado dos atendimentos e métricas de pacientes</p>
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

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total Atendidos</S.MetricTitle>
              <S.MetricValue>{dados.metricas.totalAtendidos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendAtendidos || 'neutral'}>
                {dados.metricas.variacaoAtendidos || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Remarcação</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaRemarcacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendRemarcacao || 'neutral'}>
                {dados.metricas.variacaoRemarcacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Consultas remarcadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Permanência Média</S.MetricTitle>
              <S.MetricValue>{dados.metricas.permanenciaMedia || 0} dias</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendPermanencia || 'neutral'}>
                {dados.metricas.variacaoPermanencia || '0 dias'}
              </S.MetricTrend>
              <S.MetricDetail>Internação</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Retorno</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaRetorno || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendRetorno || 'neutral'}>
                {dados.metricas.variacaoRetorno || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Pacientes recorrentes</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Distribuição por Faixa Etária</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Pizza - Distribuição Etária
                  <S.ChartData>
                    {dados.distribuicaoFaixaEtaria?.map((faixa, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={faixa.cor} />
                        {faixa.faixa}: {faixa.quantidade} ({faixa.percentual}%)
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Evolução de Atendimentos</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Linha - Tendência Mensal
                  <S.ChartData>
                    {dados.evolucaoAtendimentos?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        {item.mes}: {item.atendimentos} atendimentos
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Atendimentos por Especialidade */}
          <S.TableSection>
            <S.TableTitle>Atendimentos por Especialidade</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Especialidade</th>
                    <th>Total Atendimentos</th>
                    <th>Novos Pacientes</th>
                    <th>Retornos</th>
                    <th>Taxa Crescimento</th>
                    <th>Média Idade</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.atendimentosPorEspecialidade?.map((especialidade, index) => (
                    <tr key={index}>
                      <td><strong>{especialidade.especialidade}</strong></td>
                      <td>{especialidade.totalAtendimentos}</td>
                      <td>{especialidade.novosPacientes}</td>
                      <td>{especialidade.retornos}</td>
                      <td>
                        <S.TrendBadge trend={especialidade.crescimento >= 0 ? 'up' : 'down'}>
                          {especialidade.crescimento >= 0 ? '+' : ''}{especialidade.crescimento}%
                        </S.TrendBadge>
                      </td>
                      <td>{especialidade.mediaIdade} anos</td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Internações Ativas */}
          <S.TableSection>
            <S.TableTitle>Internações Ativas - Hoje</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
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
                  {dados.internacoesAtivas?.map((internacao, index) => (
                    <tr key={index}>
                      <td><strong>{internacao.paciente_nome}</strong></td>
                      <td>{calcularIdade(internacao.data_nascimento)} anos</td>
                      <td>{internacao.tipo_leito === 'UTI' ? 'UTI' : `Enfermaria ${internacao.n_sala}`}</td>
                      <td>{internacao.diagnostico_principal || 'Em observação'}</td>
                      <td>{internacao.dias_internado}</td>
                      <td>
                        <S.StatusBadge status={internacao.status}>
                          {internacao.status === 'estavel' ? 'Estável' : 
                           internacao.status === 'melhorando' ? 'Melhorando' : 'Crítico'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Métricas Adicionais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação Leitos</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaOcupacaoLeitos || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendOcupacao || 'neutral'}>
                {dados.metricas.variacaoOcupacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Atual</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Altas no Período</S.MetricTitle>
              <S.MetricValue>{dados.metricas.totalAltas || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendAltas || 'neutral'}>
                {dados.metricas.variacaoAltas || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Pacientes</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio Espera</S.MetricTitle>
              <S.MetricValue>{dados.metricas.tempoMedioEspera || 0} min</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendEspera || 'neutral'}>
                {dados.metricas.variacaoEspera || '0 min'}
              </S.MetricTrend>
              <S.MetricDetail>Pronto Socorro</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Satisfação</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaSatisfacao || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendSatisfacao || 'neutral'}>
                {dados.metricas.variacaoSatisfacao || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Pesquisa pacientes</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Procedimentos Realizados */}
          <S.TableSection>
            <S.TableTitle>Procedimentos Mais Realizados</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Procedimento</th>
                    <th>Quantidade</th>
                    <th>Especialidade</th>
                    <th>Crescimento</th>
                    <th>Média Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.procedimentosRealizados?.map((procedimento, index) => (
                    <tr key={index}>
                      <td><strong>{procedimento.procedimento}</strong></td>
                      <td>{procedimento.quantidade}</td>
                      <td>{procedimento.especialidade}</td>
                      <td>
                        <S.TrendBadge trend={procedimento.crescimento >= 0 ? 'up' : 'down'}>
                          {procedimento.crescimento >= 0 ? '+' : ''}{procedimento.crescimento}%
                        </S.TrendBadge>
                      </td>
                      <td>{procedimento.tempo_medio} min</td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Origem dos Pacientes */}
          <S.TableSection>
            <S.TableTitle>Origem dos Pacientes - Período Selecionado</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Origem</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                    <th>Crescimento</th>
                    <th>Tipo Principal</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.origemPacientes?.map((origem, index) => (
                    <tr key={index}>
                      <td><strong>{origem.origem}</strong></td>
                      <td>{origem.quantidade}</td>
                      <td>{origem.percentual}%</td>
                      <td>
                        <S.TrendBadge trend={origem.crescimento >= 0 ? 'up' : 'down'}>
                          {origem.crescimento >= 0 ? '+' : ''}{origem.crescimento}%
                        </S.TrendBadge>
                      </td>
                      <td>{origem.tipo_principal}</td>
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