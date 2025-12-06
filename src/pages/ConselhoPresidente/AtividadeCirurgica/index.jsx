import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ExportCirurgiasService } from "../../../services/exportAtividadeCirurgicaService";

export default function AtividadeCirurgica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoCirurgia, setTipoCirurgia] = useState('todas');
  const [especialidade, setEspecialidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
  const [dados, setDados] = useState({
    metricas: {},
    cirurgiasPorEspecialidade: [],
    topCirurgioes: [],
    proximasCirurgias: [],
    evolucaoMensal: [],
    distribuicaoTipo: []
  });

  useEffect(() => {
    fetchDadosCirurgicos();
  }, [periodo, tipoCirurgia, especialidade]);

  const fetchDadosCirurgicos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/atividadecirurgica', {
        params: { periodo, tipoCirurgia, especialidade }
      });
      setDados(response.data || {
        metricas: {},
        cirurgiasPorEspecialidade: [],
        topCirurgioes: [],
        proximasCirurgias: [],
        evolucaoMensal: [],
        distribuicaoTipo: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados cirúrgicos:", error);
      alert("Erro ao carregar dados da atividade cirúrgica");
      setDados({
        metricas: {},
        cirurgiasPorEspecialidade: [],
        topCirurgioes: [],
        proximasCirurgias: [],
        evolucaoMensal: [],
        distribuicaoTipo: []
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
      console.log('Tipo Cirurgia:', tipoCirurgia);
      console.log('Especialidade:', especialidade);
      
      setExporting(prev => ({ ...prev, [format]: true }));
      
      // Adicione um timeout para evitar bloqueio infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - Exportação demorou muito')), 30000);
      });
      
      const exportPromise = ExportCirurgiasService.exportData(format, dados, periodo, tipoCirurgia, especialidade);
      
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

  const obterMinutos = (valor) => {
    if (!valor && valor !== 0) return 0;
    
    // Se parece ser horas (valor entre 0.1 e 48)
    if (valor > 0.1 && valor < 48) {
      return Math.round(valor * 60);
    }
    
    // Se já está em minutos, arredondar
    return Math.round(valor);
  };

  const formatarDuracao = (minutos) => {
    const minutosInt = obterMinutos(minutos);
    
    if (minutosInt < 60) return `${minutosInt} min`;
    
    const horas = Math.floor(minutosInt / 60);
    const mins = minutosInt % 60;
    
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  };

  const getStatusEficiencia = (valor) => {
    if (valor >= 90) return 'alto';
    if (valor >= 80) return 'moderado';
    if (valor >= 70) return 'estavel';
    return 'baixo';
  };

  const getStatusDuracao = (minutos) => {
    const minutosInt = obterMinutos(minutos);
    
    if (minutosInt > 240) return 'critico';
    if (minutosInt > 180) return 'alerta';
    if (minutosInt > 120) return 'estavel';
    if (minutosInt > 60) return 'moderado';
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
                Atividade Cirúrgica
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado das cirurgias realizadas
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
              
              <label>Tipo de Cirurgia:</label>
              <S.Select value={tipoCirurgia} onChange={(e) => setTipoCirurgia(e.target.value)} disabled={loading}>
                <option value="todas">Todas</option>
                <option value="eletiva">Eletivas</option>
                <option value="emergencia">Emergência</option>
                <option value="urgente">Urgentes</option>
              </S.Select>
              
              <label>Especialidade:</label>
              <S.Select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} disabled={loading}>
                <option value="todas">Todas</option>
                <option value="Cirurgia Geral">Cirurgia Geral</option>
                <option value="Ortopedia">Ortopedia</option>
                <option value="Neurocirurgia">Neurocirurgia</option>
                <option value="Cardiologia">Cardiologia</option>
              </S.Select>
            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Cirurgias</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalCirurgias || 0}</S.MetricValue>
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
              <S.StatusBadge status={getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}>
                {getStatusEficiencia(dados.metricas?.taxaCrescimento || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Aprovação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaAprovacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                Cirurgias aprovadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusEficiencia(dados.metricas?.taxaAprovacao || 0)}>
                {getStatusEficiencia(dados.metricas?.taxaAprovacao || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Duração Média</S.MetricTitle>
              <S.MetricValue>{formatarDuracao(dados.metricas?.tempoMedio)}</S.MetricValue>
              <S.MetricDetail>
                Por cirurgia
              </S.MetricDetail>
              <S.StatusBadge status={getStatusDuracao(dados.metricas?.tempoMedio || 0)}>
                {getStatusDuracao(dados.metricas?.tempoMedio || 0)}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaOcupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                Salas de cirurgia
              </S.MetricDetail>
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
              Tipo de Cirurgia: <strong>{tipoCirurgia === 'todas' ? 'Todas' : tipoCirurgia}</strong> | 
              Especialidade: <strong>{especialidade === 'todas' ? 'Todas' : especialidade}</strong>
            </p>
          </div>

          {/* Distribuição por Tipo de Cirurgia */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Tipo de Cirurgia</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de distribuição...</S.ChartLoading>
            ) : (
              (dados.metricas?.distribuicaoTipo && dados.metricas.distribuicaoTipo.length > 0) ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Tipo de Cirurgia</th>
                      <th>Quantidade</th>
                      <th>Percentual</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.metricas.distribuicaoTipo.map((tipo, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{tipo.tipo}</strong>
                        </td>
                        <td>{tipo.quantidade || 0}</td>
                        <td>
                          <S.PercentValue value={tipo.percentual || 0}>
                            {tipo.percentual || 0}%
                          </S.PercentValue>
                        </td>
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

          {/* Cirurgias por Especialidade */}
          <S.TableSection>
            <S.TableTitle>Cirurgias por Especialidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de especialidades...</S.ChartLoading>
            ) : (
              dados.cirurgiasPorEspecialidade && dados.cirurgiasPorEspecialidade.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Especialidade</th>
                      <th>Total Cirurgias</th>
                      <th>Eletivas</th>
                      <th>Emergência</th>
                      <th>Tempo Médio</th>
                      <th>Taxa Sucesso</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.cirurgiasPorEspecialidade.map((especialidade, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{especialidade.especialidade || 'Não informado'}</strong>
                        </td>
                        <td>{especialidade.totalCirurgias || 0}</td>
                        <td>{especialidade.eletivas || 0}</td>
                        <td>{especialidade.emergencia || 0}</td>
                        <td>
                          <span>{formatarDuracao(especialidade.tempoMedio)}</span>
                        </td>
                        <td>
                          <S.PercentValue value={especialidade.taxaSucesso || 0}>
                            {especialidade.taxaSucesso || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusEficiencia(especialidade.taxaSucesso || 0)}>
                            {getStatusEficiencia(especialidade.taxaSucesso || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de especialidades disponível
                </div>
              )
            )}
          </S.TableSection>

          {/* Top Cirurgiões */}
          <S.TableSection>
            <S.TableTitle>Top Cirurgiões</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de cirurgiões...</S.ChartLoading>
            ) : (
              dados.topCirurgioes && dados.topCirurgioes.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Especialidade</th>
                      <th>Total Cirurgias</th>
                      <th>Tempo Médio</th>
                      <th>Taxa Sucesso</th>
                      <th>Disponível</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.topCirurgioes.map((cirurgiao, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{cirurgiao.nome || 'Não identificado'}</strong>
                        </td>
                        <td>{cirurgiao.especialidade || 'Não especificada'}</td>
                        <td>{cirurgiao.totalCirurgias || 0}</td>
                        <td>
                          <span>{formatarDuracao(cirurgiao.tempoMedio)}</span>
                        </td>
                        <td>
                          <S.PercentValue value={cirurgiao.taxaSucesso || 0}>
                            {cirurgiao.taxaSucesso || 0}%
                          </S.PercentValue>
                        </td>
                        <td>
                          <S.StatusBadge status={cirurgiao.disponivel ? 'disponivel' : 'indisponivel'}>
                            {cirurgiao.disponivel ? 'Sim' : 'Não'}
                          </S.StatusBadge>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusEficiencia(cirurgiao.taxaSucesso || 0)}>
                            {getStatusEficiencia(cirurgiao.taxaSucesso || 0)}
                          </S.StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de cirurgiões disponível
                </div>
              )
            )}
          </S.TableSection>

          {/* Próximas Cirurgias */}
          <S.TableSection>
            <S.TableTitle>Próximas Cirurgias Agendadas</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando próximas cirurgias...</S.ChartLoading>
            ) : (
              dados.proximasCirurgias && dados.proximasCirurgias.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Paciente</th>
                      <th>Procedimento</th>
                      <th>Cirurgião</th>
                      <th>Sala</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.proximasCirurgias.map((cirurgia, index) => {
                      const dataHora = cirurgia.data_hora ? new Date(cirurgia.data_hora).toLocaleString('pt-BR') : 'N/A';
                      return (
                        <tr key={index}>
                          <td>{dataHora}</td>
                          <td>{cirurgia.paciente_nome || 'Não identificado'}</td>
                          <td>{cirurgia.procedimento || 'Procedimento Cirúrgico'}</td>
                          <td>{cirurgia.cirurgiao_nome || 'Cirurgião não identificado'}</td>
                          <td>Sala {cirurgia.n_sala || 'N/A'}</td>
                          <td>
                            <S.StatusBadge status={cirurgia.status || 'agendada'}>
                              {cirurgia.status === 'confirmada' ? 'Confirmada' : 'Agendada'}
                            </S.StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhuma cirurgia agendada
                </div>
              )
            )}
          </S.TableSection>

          {/* Evolução Mensal */}
          <S.TableSection>
            <S.TableTitle>Evolução Mensal</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de evolução...</S.ChartLoading>
            ) : (
              dados.evolucaoMensal && dados.evolucaoMensal.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Cirurgias</th>
                      <th>Status</th>
                      <th>Tendência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.evolucaoMensal.map((mes, index) => {
                      let tendencia = 'Estável';
                      if (index > 0) {
                        const anterior = dados.evolucaoMensal[index - 1].cirurgias || 0;
                        if (mes.cirurgias > anterior + 10) tendencia = 'Crescimento';
                        else if (mes.cirurgias < anterior - 10) tendencia = 'Queda';
                      }
                      
                      return (
                        <tr key={index}>
                          <td>
                            <strong>{mes.mes || `Mês ${index + 1}`}</strong>
                          </td>
                          <td>{mes.cirurgias || 0}</td>
                          <td>
                            <S.StatusBadge status={getStatusEficiencia(mes.cirurgias || 0)}>
                              {getStatusEficiencia(mes.cirurgias || 0)}
                            </S.StatusBadge>
                          </td>
                          <td>
                            <span style={{
                              color: tendencia === 'Crescimento' ? '#198754' : 
                                     tendencia === 'Queda' ? '#dc3545' : '#6c757d'
                            }}>
                              {tendencia}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de evolução disponível
                </div>
              )
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