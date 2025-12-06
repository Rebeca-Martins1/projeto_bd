import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ExportSalasService } from "../../../services/exportSalasService";

export default function OcupacaoSalas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoSala, setTipoSala] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
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
      console.log(`🔄 Iniciando exportação de ${format}...`);
      console.log('Dados atuais:', dados);
      console.log('Período:', periodo);
      console.log('Tipo Sala:', tipoSala);
      
      setExporting(prev => ({ ...prev, [format]: true }));
      
      // Adicione um timeout para evitar bloqueio infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - Exportação demorou muito')), 30000);
      });
      
      const exportPromise = ExportSalasService.exportData(format, dados, periodo, tipoSala);
      
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
                Ocupação de Salas
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado da utilização das salas hospitalares
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
              <S.MetricDetail>
                {(dados.metricas?.consultorios?.ocupadas || 0)}/{(dados.metricas?.consultorios?.total || 0)} consultórios ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.consultorios?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.consultorios?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas de Cirurgia</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.cirurgia?.ocupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                {(dados.metricas?.cirurgia?.ocupadas || 0)}/{(dados.metricas?.cirurgia?.total || 0)} salas ocupadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.cirurgia?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.cirurgia?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Geral</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                {(dados.metricas?.total?.ocupadas || 0)}/{(dados.metricas?.total?.total || 0)} salas ocupadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.total?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas Disponíveis</S.MetricTitle>
              <S.MetricValue>
                {((dados.metricas?.total?.total || 0) - (dados.metricas?.total?.ocupadas || 0))}
              </S.MetricValue>
              <S.MetricDetail>Total de salas livres</S.MetricDetail>
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
              Tipo de Sala: <strong>{tipoSala === 'todas' ? 'Todas' : tipoSala}</strong>
            </p>
          </div>

          {/* Ocupação por Turno */}
          <S.TableSection>
            <S.TableTitle>Ocupação por Turno</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de turnos...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Turno</th>
                    <th>Percentual de Ocupação</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.ocupacaoPorTurno && dados.ocupacaoPorTurno.length > 0 ? (
                    dados.ocupacaoPorTurno.map((turno, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{turno.turno || `Turno ${index + 1}`}</strong>
                        </td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{turno.percentual || 0}%</span>
                            <div style={{
                              width: '80px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(turno.percentual || 0, 100)}%`,
                                height: '100%',
                                backgroundColor: turno.cor || '#3b82f6'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(turno.percentual || 0)}>
                            {getStatusText(getStatusOcupacao(turno.percentual || 0))}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhum dado de turnos disponível
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Evolução da Ocupação */}
          <S.TableSection>
            <S.TableTitle>Evolução da Ocupação</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Ocupação</th>
                    <th>Status</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.evolucaoOcupacao && dados.evolucaoOcupacao.length > 0 ? (
                    dados.evolucaoOcupacao.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{item.periodo || `Período ${index + 1}`}</strong>
                        </td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{item.ocupacao || 0}%</span>
                            <div style={{
                              width: '80px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(item.ocupacao || 0, 100)}%`,
                                height: '100%',
                                backgroundColor: (item.ocupacao || 0) > 85 ? '#dc3545' : 
                                              (item.ocupacao || 0) > 70 ? '#ffc107' : '#28a745'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(item.ocupacao || 0)}>
                            {getStatusText(getStatusOcupacao(item.ocupacao || 0))}
                          </S.StatusBadge>
                        </td>
                        <td>
                          {index > 0 ? (
                            <span style={{
                              color: (item.ocupacao || 0) > dados.evolucaoOcupacao[index-1].ocupacao ? '#198754' : '#dc3545'
                            }}>
                              {(item.ocupacao || 0) > dados.evolucaoOcupacao[index-1].ocupacao ? '▲' : '▼'} 
                              {Math.abs((item.ocupacao || 0) - dados.evolucaoOcupacao[index-1].ocupacao).toFixed(1)}%
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

          {/* Detalhamento por Especialidade */}
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.detalhamentoEspecialidades && dados.detalhamentoEspecialidades.length > 0 ? (
                    dados.detalhamentoEspecialidades.map((especialidade, index) => (
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
                            {especialidade.tipo_sala === 'CIRURGIA' && (
                              <span style={{
                                fontSize: '0.7rem',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}>
                                CIR
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{especialidade.salas_totais || 0}</td>
                        <td>{especialidade.salas_ocupadas || 0}</td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{especialidade.ocupacao || 0}%</span>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(especialidade.ocupacao || 0, 100)}%`,
                                height: '100%',
                                backgroundColor: especialidade.cor || '#3b82f6'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(especialidade.ocupacao || 0)}>
                            {getStatusText(getStatusOcupacao(especialidade.ocupacao || 0))}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhuma especialidade disponível para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Salas de Cirurgia - Agendamentos */}
          <S.TableSection>
            <S.TableTitle>Salas de Cirurgia - Agendamentos</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Cirurgias Hoje</th>
                    <th>Status</th>
                    <th>Especialidade Principal</th>
                    <th>Capacidade Diária</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.salasCirurgia && dados.salasCirurgia.length > 0 ? (
                    dados.salasCirurgia.map((sala, index) => (
                      <tr key={index}>
                        <td>
                          <strong>Sala {sala.n_sala || 'N/A'}</strong>
                        </td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{sala.cirurgias_hoje || 0}</span>
                            <div style={{
                              width: '80px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(((sala.cirurgias_hoje || 0) / (sala.capacidade_diaria || 1)) * 100, 100)}%`,
                                height: '100%',
                                backgroundColor: (sala.cirurgias_hoje || 0) >= (sala.capacidade_diaria || 1) ? '#dc3545' : 
                                              (sala.cirurgias_hoje || 0) >= ((sala.capacidade_diaria || 1) * 0.8) ? '#ffc107' : '#28a745'
                              }} />
                            </div>
                            <span>/ {sala.capacidade_diaria || 0}</span>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={sala.status || 'disponivel'}>
                            {sala.status === 'ocupada' ? 'Ocupada' :
                             sala.status === 'disponivel' ? 'Disponível' :
                             sala.status === 'manutencao' ? 'Manutenção' : 'Livre'}
                          </S.StatusBadge>
                        </td>
                        <td>{sala.especialidade_principal || 'Não especificada'}</td>
                        <td>{sala.capacidade_diaria || 0} cirurgias</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhuma sala de cirurgia disponível para os filtros selecionados
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