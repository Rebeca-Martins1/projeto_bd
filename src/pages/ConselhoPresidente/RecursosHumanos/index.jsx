import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";

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
      const response = await axios.get('http://localhost:5000/api/conselho-presidente/recursos-humanos', {
        params: { periodo, departamento, turno }
      });
      setDados(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados de recursos humanos:", error);
      alert("Erro ao carregar dados de recursos humanos");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export-rh`, {
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
    return 'normal';
  };

  const getStatusSobrecarga = (horas, limite = 60) => {
    if (horas > limite) return 'critico';
    if (horas > limite - 5) return 'alerta';
    return 'normal';
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
            <h1>Recursos Humanos</h1>
            <p>Relatório detalhado da força de trabalho e distribuição de plantões</p>
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
            
            <label>Departamento:</label>
            <S.Select value={departamento} onChange={(e) => setDepartamento(e.target.value)} disabled={loading}>
              <option value="todos">Todos os Departamentos</option>
              <option value="medicos">Médicos</option>
              <option value="enfermagem">Enfermagem</option>
              <option value="administrativo">Administrativo</option>
            </S.Select>

            <label>Turno:</label>
            <S.Select value={turno} onChange={(e) => setTurno(e.target.value)} disabled={loading}>
              <option value="todos">Todos os Turnos</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Horas Trabalhadas</S.MetricTitle>
              <S.MetricValue>{dados.metricas.horasTrabalhadas || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendHoras || 'neutral'}>
                {dados.metricas.variacaoHoras || '0h'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Plantões Ativos</S.MetricTitle>
              <S.MetricValue>{dados.metricas.plantoesAtivos || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendPlantoes || 'neutral'}>
                {dados.metricas.variacaoPlantoes || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Atualmente</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Alertas de Sobrecarga</S.MetricTitle>
              <S.MetricValue>{dados.metricas.alertasSobrecarga || 0}</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendAlertas || 'neutral'}>
                {dados.metricas.variacaoAlertas || '0'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Média por Enfermeiro</S.MetricTitle>
              <S.MetricValue>{dados.metricas.mediaEnfermeiro || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendMediaEnfermeiro || 'neutral'}>
                {dados.metricas.variacaoMediaEnfermeiro || '0h'}
              </S.MetricTrend>
              <S.MetricDetail>Por semana</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Distribuição de Plantões</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Barras - Distribuição por Turno e Departamento
                  <S.ChartData>
                    {dados.distribuicaoDepartamentos?.map((depto, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color={depto.cor} />
                        {depto.departamento}: {depto.plantoes} plantões ({depto.percentual}%)
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Evolução de Horas</S.ChartTitle>
              {loading ? (
                <S.ChartLoading>Carregando gráfico...</S.ChartLoading>
              ) : (
                <S.ChartPlaceholder>
                  Gráfico de Linha - Tendência de Horas Trabalhadas
                  <S.ChartData>
                    {dados.evolucaoHoras?.map((item, index) => (
                      <S.ChartDataItem key={index}>
                        <S.ChartDataColor color="#10b981" />
                        {item.periodo}: {item.horas}h ({item.variacao})
                      </S.ChartDataItem>
                    ))}
                  </S.ChartData>
                </S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Distribuição por Departamento */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Departamento</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Total Funcionários</th>
                    <th>Horas Trabalhadas</th>
                    <th>Média Horas/Func.</th>
                    <th>Plantões Ativos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.distribuicaoDepartamentos?.map((depto, index) => (
                    <tr key={index}>
                      <td><strong>{depto.departamento}</strong></td>
                      <td>{depto.totalFuncionarios}</td>
                      <td>{depto.horasTrabalhadas}h</td>
                      <td>{depto.mediaHoras}h</td>
                      <td>{depto.plantoesAtivos}</td>
                      <td>
                        <S.StatusBadge status={getStatusCapacidade(depto.capacidade)}>
                          {getStatusCapacidade(depto.capacidade) === 'critico' ? 'Crítico' :
                           getStatusCapacidade(depto.capacidade) === 'alerta' ? 'Alerta' :
                           getStatusCapacidade(depto.capacidade) === 'estavel' ? 'Estável' : 'Normal'}
                        </S.StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Plantões Ativos */}
          <S.TableSection>
            <S.TableTitle>Plantões Ativos - Hoje</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
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
                  {dados.plantoesAtivos?.map((plantao, index) => (
                    <tr key={index}>
                      <td><strong>{plantao.setor}</strong></td>
                      <td>{plantao.turno}</td>
                      <td>{plantao.profissionais}</td>
                      <td>{plantao.horario}</td>
                      <td>{plantao.capacidadeAtual}/{plantao.capacidadeTotal}</td>
                      <td>
                        <S.StatusBadge status={getStatusCapacidade(plantao.percentualCapacidade)}>
                          {getStatusCapacidade(plantao.percentualCapacidade) === 'critico' ? 'Crítico' :
                           getStatusCapacidade(plantao.percentualCapacidade) === 'alerta' ? 'Alerta' : 'Normal'}
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
              <S.MetricTitle>Taxa de Absenteísmo</S.MetricTitle>
              <S.MetricValue>{dados.metricas.taxaAbsenteismo || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendAbsenteismo || 'neutral'}>
                {dados.metricas.variacaoAbsenteismo || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Horas Extras</S.MetricTitle>
              <S.MetricValue>{dados.metricas.horasExtras || 0}h</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendHorasExtras || 'neutral'}>
                {dados.metricas.variacaoHorasExtras || '0h'}
              </S.MetricTrend>
              <S.MetricDetail>Este período</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Turnover</S.MetricTitle>
              <S.MetricValue>{dados.metricas.turnover || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendTurnover || 'neutral'}>
                {dados.metricas.variacaoTurnover || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Último trimestre</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Capacidade Ociosa</S.MetricTitle>
              <S.MetricValue>{dados.metricas.capacidadeOciosa || 0}%</S.MetricValue>
              <S.MetricTrend trend={dados.metricas.trendCapacidadeOciosa || 'neutral'}>
                {dados.metricas.variacaoCapacidadeOciosa || '0%'}
              </S.MetricTrend>
              <S.MetricDetail>Recursos disponíveis</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Funcionários em Sobrecarga */}
          <S.TableSection>
            <S.TableTitle>Alertas - Funcionários em Sobrecarga</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Departamento</th>
                    <th>Horas Trabalhadas</th>
                    <th>Limite</th>
                    <th>Excesso</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.funcionariosSobrecarga?.map((funcionario, index) => (
                    <tr key={index}>
                      <td><strong>{funcionario.nome}</strong></td>
                      <td>{funcionario.departamento}</td>
                      <td>{funcionario.horasTrabalhadas}h</td>
                      <td>{funcionario.limiteHoras}h</td>
                      <td>{funcionario.excesso}h</td>
                      <td>
                        <S.ActionButton 
                          onClick={() => alert(`Revisando carga horária de ${funcionario.nome}`)}
                        >
                          Revisar
                        </S.ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Previsão de Demandas */}
          <S.TableSection>
            <S.TableTitle>Previsão de Demandas - Próxima Semana</S.TableTitle>
            {loading ? (
              <S.TableLoading>Carregando dados...</S.TableLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Demanda Prevista</th>
                    <th>Recursos Atuais</th>
                    <th>Gap</th>
                    <th>Recomendação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.previsaoDemandas?.map((demanda, index) => (
                    <tr key={index}>
                      <td><strong>{demanda.setor}</strong></td>
                      <td>{demanda.demandaPrevista} profissionais</td>
                      <td>{demanda.recursosAtuais} profissionais</td>
                      <td>{demanda.gap > 0 ? '+' : ''}{demanda.gap}</td>
                      <td>
                        <S.StatusBadge status={demanda.status}>
                          {demanda.recomendacao}
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