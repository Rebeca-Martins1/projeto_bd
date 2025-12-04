import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, Users, Clock, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function RecursosHumanos() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [departamento, setDepartamento] = useState('todos');
  const [turno, setTurno] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    metricas: {},
    distribuicaoDepartamentos: [],
    plantoesAtivos: [],
    funcionariosSobrecarga: [],
    previsaoDemandas: [],
    evolucaoHoras: []
  });

  useEffect(() => {
    fetchDadosRecursosHumanos();
  }, [periodo, departamento, turno]);

  const fetchDadosRecursosHumanos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/recursoshumanos', {
        params: { periodo, departamento, turno }
      });
      setDados(response.data || {
        metricas: {},
        distribuicaoDepartamentos: [],
        plantoesAtivos: [],
        funcionariosSobrecarga: [],
        previsaoDemandas: [],
        evolucaoHoras: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados de recursos humanos:", error);
      alert("Erro ao carregar dados de recursos humanos");
      setDados({
        metricas: {},
        distribuicaoDepartamentos: [],
        plantoesAtivos: [],
        funcionariosSobrecarga: [],
        previsaoDemandas: [],
        evolucaoHoras: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/exportrh`, {
        params: { format, periodo, departamento, turno },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recursos-humanos-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatório");
    }
  };

  const getStatusCapacidade = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixo';
  };

  const getStatusSobrecarga = (excesso) => {
    if (excesso > 30) return 'critico';
    if (excesso > 20) return 'alerta';
    if (excesso > 10) return 'estavel';
    return 'baixo';
  };

  const formatarPercentual = (valor) => {
    return `${valor >= 0 ? '+' : ''}${valor}%`;
  };

  const formatarVariacao = (variacao) => {
    if (!variacao) return '0%';
    if (typeof variacao === 'string') return variacao;
    return formatarPercentual(variacao);
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
                Recursos Humanos
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado da força de trabalho e distribuição de plantões
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
              
              <label>Departamento:</label>
              <S.Select value={departamento} onChange={(e) => setDepartamento(e.target.value)} disabled={loading}>
                <option value="todos">Todos os Departamentos</option>
                <option value="medicos">Médicos</option>
                <option value="enfermagem">Enfermagem</option>
                <option value="administrativo">Administrativo</option>
                <option value="tecnicos">Técnicos</option>
                <option value="apoio">Apoio</option>
              </S.Select>

              <label>Turno:</label>
              <S.Select value={turno} onChange={(e) => setTurno(e.target.value)} disabled={loading}>
                <option value="todos">Todos os Turnos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total Funcionários</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalFuncionarios || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendFuncionarios || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoFuncionarios || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Ativos no período
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Horas Trabalhadas</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.horasTrabalhadas || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendHoras || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoHoras || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa Absenteísmo</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaAbsenteismo || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendAbsenteismo || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoAbsenteismo || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Média mensal
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Turnover</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.turnover || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas?.trendTurnover || 'neutral'}>
                {formatarVariacao(dados.metricas?.variacaoTurnover || 0)}
              </S.MetricTrend>
              <S.MetricDetail>
                Último trimestre
              </S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Distribuição por Departamento */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Departamento</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : dados.distribuicaoDepartamentos && dados.distribuicaoDepartamentos.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Total Funcionários</th>
                    <th>Média Horas/Func.</th>
                    <th>Plantões Ativos</th>
                    <th>Capacidade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.distribuicaoDepartamentos.map((depto, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{depto.departamento || 'Não informado'}</strong>
                      </td>
                      <td>{depto.totalFuncionarios || 0}</td>
                      <td>{depto.mediaHoras || 0}h</td>
                      <td>{depto.plantoesAtivos || 0}</td>
                      <td>
                        <S.PercentValue value={depto.capacidade || 0}>
                          {depto.capacidade || 0}%
                        </S.PercentValue>
                      </td>
                      <td>
                        <S.StatusBadge status={getStatusCapacidade(depto.capacidade || 0)}>
                          {getStatusCapacidade(depto.capacidade || 0)}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhum departamento disponível para os filtros selecionados
              </div>
            )}
          </S.TableSection>

          {/* Plantões Ativos */}
          <S.TableSection>
            <S.TableTitle>Plantões Ativos - Hoje</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : dados.plantoesAtivos && dados.plantoesAtivos.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Turno</th>
                    <th>Profissionais</th>
                    <th>Horário</th>
                    <th>Capacidade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.plantoesAtivos.map((plantao, index) => (
                    <tr key={index}>
                      <td><strong>{plantao.setor || 'Não informado'}</strong></td>
                      <td>
                        <S.TurnoBadge turno={plantao.turno}>
                          {plantao.turno || 'Não informado'}
                        </S.TurnoBadge>
                      </td>
                      <td>{plantao.profissionais || 0}</td>
                      <td>{plantao.horario || 'N/A'}</td>
                      <td>{(plantao.capacidadeAtual || 0)}/{(plantao.capacidadeTotal || 0)}</td>
                      <td>
                        <S.StatusBadge status={getStatusCapacidade(plantao.percentualCapacidade || 0)}>
                          {getStatusCapacidade(plantao.percentualCapacidade || 0)}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhum plantão ativo para os filtros selecionados
              </div>
            )}
          </S.TableSection>

          {/* Funcionários em Sobrecarga */}
          <S.TableSection>
            <S.TableTitle>Alertas - Funcionários em Sobrecarga</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : dados.funcionariosSobrecarga && dados.funcionariosSobrecarga.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Departamento</th>
                    <th>Horas Trabalhadas</th>
                    <th>Limite</th>
                    <th>Excesso</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.funcionariosSobrecarga.map((funcionario, index) => (
                    <tr key={index}>
                      <td><strong>{funcionario.nome || 'Não informado'}</strong></td>
                      <td>{funcionario.departamento || 'Não informado'}</td>
                      <td>{funcionario.horasTrabalhadas || 0}h</td>
                      <td>{funcionario.limiteHoras || 0}h</td>
                      <td style={{ color: '#dc2626', fontWeight: '600' }}>+{funcionario.excesso || 0}h</td>
                      <td>
                        <S.StatusBadge status={getStatusSobrecarga(funcionario.excesso || 0)}>
                          {getStatusSobrecarga(funcionario.excesso || 0)}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhum alerta de sobrecarga para os filtros selecionados
              </div>
            )}
          </S.TableSection>

          {/* Previsão de Demandas */}
          <S.TableSection>
            <S.TableTitle>Previsão de Demandas - Próxima Semana</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : dados.previsaoDemandas && dados.previsaoDemandas.length > 0 ? (
              <S.Table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Demanda Prevista</th>
                    <th>Recursos Atuais</th>
                    <th>Gap</th>
                    <th>Status</th>
                    <th>Recomendação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.previsaoDemandas.map((demanda, index) => (
                    <tr key={index}>
                      <td><strong>{demanda.setor || 'Não informado'}</strong></td>
                      <td>{demanda.demandaPrevista || 0} profissionais</td>
                      <td>{demanda.recursosAtuais || 0} profissionais</td>
                      <td style={{ 
                        color: (demanda.gap || 0) > 0 ? '#dc2626' : '#059669',
                        fontWeight: '600'
                      }}>
                        {(demanda.gap || 0) > 0 ? '+' : ''}{demanda.gap || 0}
                      </td>
                      <td>
                        <S.StatusBadge status={demanda.status || 'normal'}>
                          {demanda.status || 'Normal'}
                        </S.StatusBadge>
                      </td>
                      <td>{demanda.recomendacao || 'Nenhuma recomendação'}</td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhuma previsão de demanda disponível
              </div>
            )}
          </S.TableSection>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}