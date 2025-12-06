import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ExportAtividadeMedicaService } from "../../../services/exportAtividadeMedicaService";

export default function AtividadeMedica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [especialidade, setEspecialidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
  const [dados, setDados] = useState({
    metricas: {},
    especialidades: [],
    topMedicos: [],
    evolucaoMensal: []
  });

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
        especialidades: [],
        topMedicos: [],
        evolucaoMensal: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados médicos:", error);
      alert("Erro ao carregar dados da atividade médica");
      setDados({
        metricas: {},
        especialidades: [],
        topMedicos: [],
        evolucaoMensal: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      console.log(`🔄 Iniciando exportação de ${format}...`);
      console.log('Dados atuais:', dados);
      console.log('Período:', periodo);
      console.log('Especialidade:', especialidade);
      
      setExporting(prev => ({ ...prev, [format]: true }));
      
      // Adicione um timeout para evitar bloqueio infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - Exportação demorou muito')), 30000);
      });
      
      const exportPromise = ExportAtividadeMedicaService.exportData(format, dados, periodo, especialidade);
      
      await Promise.race([exportPromise, timeoutPromise]);
      
      setExporting(prev => ({ ...prev, [format]: false }));
      console.log(`✅ ${format.toUpperCase()} exportado com sucesso!`);
      
    } catch (error) {
      console.error(`❌ Erro ao exportar ${format}:`, error);
      
      // Mostrar erro detalhado
      alert(`Erro ao exportar ${format.toUpperCase()}:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
      
      setExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  const getStatusOcupacao = (percentual) => {
    if (percentual >= 90) return 'critico';
    if (percentual >= 80) return 'alerta';
    if (percentual >= 60) return 'estavel';
    return 'baixa';
  };

  const getStatusText = (status) => {
    const map = {
      critico: 'Crítico',
      alerta: 'Alerta',
      estavel: 'Estável',
      baixa: 'Baixa'
    };
    return map[status] || status;
  };

  const formatarDuracao = (minutos) => {
    if (!minutos && minutos !== 0) return '0 min';
    
    // Garantir que estamos trabalhando com minutos
    let minutosCorrigidos = minutos;
    
    // Se o valor for menor que 60 (provavelmente está em horas)
    if (minutos < 60 && minutos > 0) {
      // Converter horas para minutos
      minutosCorrigidos = minutos * 60;
    }
    
    // Arredondar para o número inteiro mais próximo
    const minutosInt = Math.round(minutosCorrigidos);
    
    // Se for menos de 60 minutos, mostrar apenas minutos
    if (minutosInt < 60) return `${minutosInt} min`;
    
    // Para 60 minutos ou mais, converter para horas
    const horas = Math.floor(minutosInt / 60);
    const mins = minutosInt % 60;
    
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
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
              {loading && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  color: '#3b82f6', 
                  marginTop: '0.5rem', 
                  fontSize: '0.875rem' 
                }}>
                  <RefreshCw size={16} className="spinner" />
                  Carregando dados...
                </div>
              )}
            </div>
            
            {/* Botões de exportar à direita */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              alignSelf: 'center'
            }}>
              <button
                onClick={() => handleExport('pdf')}
                disabled={loading || exporting.pdf}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: (loading || exporting.pdf) ? 0.6 : 1
                }}
              >
                <FileText size={16} />
                {exporting.pdf ? 'Gerando...' : 'Exportar PDF'}
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                disabled={loading || exporting.excel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#198754',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: (loading || exporting.excel) ? 0.6 : 1
                }}
              >
                <Download size={16} />
                {exporting.excel ? 'Gerando...' : 'Exportar Excel'}
              </button>
            </div>
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
                <option value="Cardiologia">Cardiologia</option>
                <option value="Ortopedia">Ortopedia</option>
                <option value="Pediatria">Pediatria</option>
                <option value="Ginecologia">Ginecologia</option>
                <option value="Dermatologia">Dermatologia</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Consultas</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalConsultas || 0}</S.MetricValue>
              <S.MetricDetail>
                Período selecionado
              </S.MetricDetail>
              <S.StatusBadge status={dados.metricas?.trendConsultas === 'up' ? 'alerta' : 'estavel'}>
                {dados.metricas?.trendConsultas === 'up' ? 'Crescendo' : 'Estável'}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas?.tempoMedio || 0)}</S.MetricValue>
              <S.MetricDetail>
                Por consulta
              </S.MetricDetail>
              <S.StatusBadge status={dados.metricas?.trendTempo === 'up' ? 'alerta' : 'estavel'}>
                {dados.metricas?.trendTempo === 'up' ? 'Aumentando' : 'Estável'}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Comparecimento</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaComparecimento || 0}%</S.MetricValue>
              <S.MetricDetail>
                Consultas realizadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.taxaComparecimento || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.taxaComparecimento || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Médicos Ativos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.medicosAtivos || 0}</S.MetricValue>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
              <S.StatusBadge status="estavel">
                Ativo
              </S.StatusBadge>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Informações de Exportação */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Download size={16} color="#0d6efd" />
              <strong style={{ color: '#0d6efd' }}>Exportação de Relatórios</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6c757d' }}>
              Os relatórios PDF e Excel são gerados com dados atualizados do banco de dados em tempo real.
              Período selecionado: <strong>{periodo === 'semana' ? 'Última Semana' : periodo === 'mes' ? 'Último Mês' : periodo === 'trimestre' ? 'Último Trimestre' : 'Último Ano'}</strong> | 
              Especialidade: <strong>{especialidade === 'todas' ? 'Todas' : especialidade}</strong>
            </p>
          </div>

          {/* Evolução Mensal */}
          <S.TableSection>
            <S.TableTitle>Evolução Mensal de Consultas</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Consultas</th>
                    <th>Status</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.evolucaoMensal && dados.evolucaoMensal.length > 0 ? (
                    dados.evolucaoMensal.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{item.mes || `Mês ${index + 1}`}</strong>
                        </td>
                        <td>{item.consultas || 0}</td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao((item.consultas || 0) / 10)}>
                            {getStatusText(getStatusOcupacao((item.consultas || 0) / 10))}
                          </S.StatusBadge>
                        </td>
                        <td>
                          {index > 0 ? (
                            <span style={{
                              color: (item.consultas || 0) > dados.evolucaoMensal[index-1].consultas ? '#198754' : '#dc3545'
                            }}>
                              {(item.consultas || 0) > dados.evolucaoMensal[index-1].consultas ? '▲' : '▼'} 
                              {Math.abs((item.consultas || 0) - dados.evolucaoMensal[index-1].consultas).toFixed(0)}
                            </span>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhum dado de evolução disponível
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Especialidades */}
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
                    <th>Comparecimento</th>
                    <th>Crescimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.especialidades && dados.especialidades.length > 0 ? (
                    dados.especialidades.map((especialidade, index) => (
                      <tr key={index}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: especialidade.cor || '#6b7280'
                            }} />
                            <strong>{especialidade.especialidade || 'Não informado'}</strong>
                          </div>
                        </td>
                        <td>{especialidade.totalConsultas || 0}</td>
                        <td>{formatarDuracao(especialidade.tempoMedio)}</td>
                        <td>{especialidade.taxaComparecimento || 0}%</td>
                        <td>
                          <S.PercentValue value={especialidade.crescimento || 0}>
                            {especialidade.crescimento || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(especialidade.taxaComparecimento || 0)}>
                            {getStatusText(getStatusOcupacao(especialidade.taxaComparecimento || 0))}
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

          {/* Top Médicos */}
          <S.TableSection>
            <S.TableTitle>Top Médicos - Maior Número de Consultas</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Especialidade</th>
                    <th>Consultas</th>
                    <th>Tempo Médio</th>
                    <th>Eficiência</th>
                    <th>Disponível</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.topMedicos && dados.topMedicos.length > 0 ? (
                    dados.topMedicos.map((medico, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{medico.nome || 'Médico não identificado'}</strong>
                        </td>
                        <td>{medico.especialidade || 'Não especificada'}</td>
                        <td>{medico.totalConsultas || 0}</td>
                        <td>{formatarDuracao(medico.tempoMedio)}</td>
                        <td>
                          <S.PercentValue value={medico.eficiencia || 0}>
                            {medico.eficiencia || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={medico.disponivel ? 'estavel' : 'baixa'}>
                            {medico.disponivel ? 'Sim' : 'Não'}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhum médico disponível para os filtros selecionados
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

      <style jsx="true">{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
