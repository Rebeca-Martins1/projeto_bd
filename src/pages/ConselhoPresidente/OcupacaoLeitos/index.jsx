import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ExportLeitosService } from "../../../services/exportLeitosService";

export default function OcupacaoLeitos() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [unidade, setUnidade] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
  const [dados, setDados] = useState({
    metricas: {},
    detalhamentoSetores: [],
    tendenciaOcupacao: [],
    distribuicaoUnidades: []
  });

  useEffect(() => {
    fetchDadosLeitos();
  }, [periodo, unidade]);

  const fetchDadosLeitos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/ocupacaoleitos', {
        params: { periodo, unidade }
      });
      setDados(response.data || {
        metricas: {},
        detalhamentoSetores: [],
        tendenciaOcupacao: [],
        distribuicaoUnidades: []
      });
    } catch (error) {
      console.error("Erro ao buscar dados de leitos:", error);
      alert("Erro ao carregar dados de ocupação de leitos");
      setDados({
        metricas: {},
        detalhamentoSetores: [],
        tendenciaOcupacao: [],
        distribuicaoUnidades: []
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
      console.log('Unidade:', unidade);
      
      setExporting(prev => ({ ...prev, [format]: true }));
      
      // Adicione um timeout para evitar bloqueio infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - Exportação demorou muito')), 30000);
      });
      
      const exportPromise = ExportLeitosService.exportData(format, dados, periodo, unidade);
      
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
                Ocupação de Leitos
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado da ocupação hospitalar
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
              
              <label>Unidade:</label>
              <S.Select value={unidade} onChange={(e) => setUnidade(e.target.value)} disabled={loading}>
                <option value="todas">Todas as Unidades</option>
                <option value="UTI">UTI</option>
                <option value="ENFERMARIA">Enfermaria</option>
              </S.Select>

            </S.FilterGroup>
          </S.FilterSection>

          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>UTI</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.uti?.ocupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                {(dados.metricas?.uti?.ocupados || 0)}/{(dados.metricas?.uti?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.uti?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.uti?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Enfermaria</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.enfermaria?.ocupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                {(dados.metricas?.enfermaria?.ocupados || 0)}/{(dados.metricas?.enfermaria?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.enfermaria?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.enfermaria?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Total Hospitalar</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.total?.ocupacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                {(dados.metricas?.total?.ocupados || 0)}/{(dados.metricas?.total?.total || 0)} leitos ocupados
              </S.MetricDetail>
              <S.StatusBadge status={getStatusOcupacao(dados.metricas?.total?.ocupacao || 0)}>
                {getStatusText(getStatusOcupacao(dados.metricas?.total?.ocupacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Leitos Disponíveis</S.MetricTitle>
              <S.MetricValue>
                {((dados.metricas?.total?.total || 0) - (dados.metricas?.total?.ocupados || 0))}
              </S.MetricValue>
              <S.MetricDetail>Total de leitos livres</S.MetricDetail>
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
              Unidade: <strong>{unidade === 'todas' ? 'Todas' : unidade}</strong>
            </p>
          </div>

          {/* Tabela Detalhada */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Setor</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : (
              <S.Table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Tipo</th>
                    <th>Leitos Totais</th>
                    <th>Leitos Ocupados</th>
                    <th>Leitos Livres</th>
                    <th>Ocupação</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.detalhamentoSetores && dados.detalhamentoSetores.length > 0 ? (
                    dados.detalhamentoSetores.map((setor, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{setor.setor || 'Não informado'}</strong>
                        </td>
                        <td>{setor.tipo || 'Não especificado'}</td>
                        <td>{setor.leitos_totais || 0}</td>
                        <td>{setor.leitos_ocupados || 0}</td>
                        <td>{setor.leitos_livres || 0}</td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{setor.ocupacao || 0}%</span>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(setor.ocupacao || 0, 100)}%`,
                                height: '100%',
                                backgroundColor: (setor.ocupacao || 0) > 85 ? '#dc3545' : 
                                              (setor.ocupacao || 0) > 70 ? '#ffc107' : '#28a745'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(setor.ocupacao || 0)}>
                            {getStatusText(getStatusOcupacao(setor.ocupacao || 0))}
                          </S.StatusBadge>
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

          {/* Distribuição por Unidade */}
          <S.TableSection>
            <S.TableTitle>Distribuição por Unidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de distribuição...</S.ChartLoading>
            ) : (
              dados.distribuicaoUnidades && dados.distribuicaoUnidades.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Tipo de Leito</th>
                      <th>Leitos</th>
                      <th>Percentual</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.distribuicaoUnidades.map((unidadeItem, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{unidadeItem.tipo || `Setor ${index + 1}`}</strong>
                        </td>
                        <td>{unidadeItem.leitos || 0}</td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{unidadeItem.percentual || 0}%</span>
                            <div style={{
                              width: '80px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(unidadeItem.percentual || 0, 100)}%`,
                                height: '100%',
                                backgroundColor: unidadeItem.cor || '#3b82f6'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusOcupacao(unidadeItem.percentual || 0)}>
                            {getStatusText(getStatusOcupacao(unidadeItem.percentual || 0))}
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

          {/* Tendência de Ocupação */}
          <S.TableSection>
            <S.TableTitle>Tendência de Ocupação (Últimos 7 Dias)</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados de tendência...</S.ChartLoading>
            ) : (
              dados.tendenciaOcupacao && dados.tendenciaOcupacao.length > 0 ? (
                <S.Table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Ocupação UTI</th>
                      <th>Ocupação Enfermaria</th>
                      <th>Status Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.tendenciaOcupacao.slice(0, 7).map((ponto, index) => {
                      const mediaOcupacao = ((ponto.uti || 0) + (ponto.enfermaria || 0)) / 2;
                      return (
                        <tr key={index}>
                          <td>{ponto.data || `Dia ${index + 1}`}</td>
                          <td>
                            <S.PercentValue value={ponto.uti || 0}>
                              {ponto.uti || 0}%
                            </S.PercentValue>
                          </td>
                          <td>
                            <S.PercentValue value={ponto.enfermaria || 0}>
                              {ponto.enfermaria || 0}%
                            </S.PercentValue>
                          </td>
                          <td>
                            <S.StatusBadge status={getStatusOcupacao(mediaOcupacao)}>
                              {getStatusText(getStatusOcupacao(mediaOcupacao))}
                            </S.StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Nenhum dado de tendência disponível
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