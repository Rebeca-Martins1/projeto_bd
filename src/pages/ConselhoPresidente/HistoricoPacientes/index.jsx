import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import axios from "axios";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ExportHistoricoPacientesService } from "../../../services/exportHistoricoPacientesService";

export default function HistoricoPacientes() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');
  const [tipoAtendimento, setTipoAtendimento] = useState('todos');
  const [faixaEtaria, setFaixaEtaria] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
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
      console.log(`🔄 Iniciando exportação de ${format}...`);
      console.log('Dados atuais:', dados);
      console.log('Período:', periodo);
      console.log('Tipo Atendimento:', tipoAtendimento);
      console.log('Faixa Etária:', faixaEtaria);
      
      setExporting(prev => ({ ...prev, [format]: true }));
      
      // Adicione um timeout para evitar bloqueio infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - Exportação demorou muito')), 30000);
      });
      
      const exportPromise = ExportHistoricoPacientesService.exportData(format, dados, periodo, tipoAtendimento, faixaEtaria);
      
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

  const getStatusText = (status) => {
    const map = {
      critico: 'Crítico',
      alerta: 'Alerta',
      estavel: 'Estável',
      baixo: 'Baixo',
      alto: 'Alto',
      moderado: 'Moderado'
    };
    return map[status] || status;
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
                Histórico de Pacientes
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4b5563',
                margin: '0'
              }}>
                Relatório detalhado dos atendimentos e métricas de pacientes
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
              <S.MetricDetail>
                Este período
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Remarcação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaRemarcacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                Consultas remarcadas
              </S.MetricDetail>
              <S.StatusBadge status={getStatusAtendimento(dados.metricas?.taxaRemarcacao || 0)}>
                {getStatusText(getStatusAtendimento(dados.metricas?.taxaRemarcacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Permanência Média</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.permanenciaMedia || 0} dias</S.MetricValue>
              <S.MetricDetail>
                Internação
              </S.MetricDetail>
              <S.StatusBadge status={getStatusPermanencia(dados.metricas?.permanenciaMedia || 0)}>
                {getStatusText(getStatusPermanencia(dados.metricas?.permanenciaMedia || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Retorno</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaRetorno || 0}%</S.MetricValue>
              <S.MetricDetail>
                Pacientes recorrentes
              </S.MetricDetail>
              <S.StatusBadge status={getStatusAtendimento(dados.metricas?.taxaRetorno || 0)}>
                {getStatusText(getStatusAtendimento(dados.metricas?.taxaRetorno || 0))}
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
              Período: <strong>{periodo === 'semana' ? 'Última Semana' : periodo === 'mes' ? 'Último Mês' : periodo === 'trimestre' ? 'Último Trimestre' : 'Último Ano'}</strong> | 
              Atendimento: <strong>{tipoAtendimento === 'todos' ? 'Todos' : tipoAtendimento === 'consulta' ? 'Consultas' : tipoAtendimento === 'emergencia' ? 'Emergência' : tipoAtendimento === 'internacao' ? 'Internação' : 'Cirurgias'}</strong> | 
              Faixa Etária: <strong>{faixaEtaria === 'todas' ? 'Todas' : faixaEtaria === 'criancas' ? '0-12 anos' : faixaEtaria === 'adolescentes' ? '13-17 anos' : faixaEtaria === 'adultos' ? '18-59 anos' : '60+ anos'}</strong>
            </p>
          </div>

          {/* Atendimentos por Especialidade */}
          <S.TableSection>
            <S.TableTitle>Atendimentos por Especialidade</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados da tabela...</S.ChartLoading>
            ) : (
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
                  {dados.atendimentosPorEspecialidade && dados.atendimentosPorEspecialidade.length > 0 ? (
                    dados.atendimentosPorEspecialidade.map((especialidade, index) => {
                      const crescimentoNum = parseFloat(especialidade.crescimento?.toString().replace(/[^0-9.-]/g, '') || especialidade.crescimento || 0);
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
                              {formatarVariacao(especialidade.crescimento)}
                            </S.PercentValue>
                          </td>
                          <td>
                            <S.StatusBadge status={getStatusAtendimento(crescimentoNum)}>
                              {getStatusText(getStatusAtendimento(crescimentoNum))}
                            </S.StatusBadge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        Nenhum atendimento registrado para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </S.Table>
            )}
          </S.TableSection>

          {/* Internações Ativas */}
          <S.TableSection>
            <S.TableTitle>Internações Ativas - Hoje</S.TableTitle>
            {loading ? (
              <S.ChartLoading>Carregando dados...</S.ChartLoading>
            ) : (
              dados.internacoesAtivas && dados.internacoesAtivas.length > 0 ? (
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
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{internacao.dias_internado || 0} dias</span>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min((internacao.dias_internado || 0) * 5, 100)}%`,
                                height: '100%',
                                backgroundColor: (internacao.dias_internado || 0) >= 30 ? '#dc3545' : 
                                              (internacao.dias_internado || 0) >= 15 ? '#ffc107' : '#28a745'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <S.StatusBadge status={getStatusPermanencia(internacao.dias_internado || 0)}>
                            {getStatusText(getStatusPermanencia(internacao.dias_internado || 0))}
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
              )
            )}
          </S.TableSection>

          {/* Métricas Adicionais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Taxa de Ocupação Leitos</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaOcupacaoLeitos || 0}%</S.MetricValue>
              <S.MetricDetail>
                Atual
              </S.MetricDetail>
              <S.StatusBadge status={getStatusAtendimento(dados.metricas?.taxaOcupacaoLeitos || 0)}>
                {getStatusText(getStatusAtendimento(dados.metricas?.taxaOcupacaoLeitos || 0))}
              </S.StatusBadge>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Altas no Período</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.totalAltas || 0}</S.MetricValue>
              <S.MetricDetail>
                Pacientes
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio Espera</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.tempoMedioEspera || 0} min</S.MetricValue>
              <S.MetricDetail>
                Pronto Socorro
              </S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Satisfação</S.MetricTitle>
              <S.MetricValue>{dados.metricas?.taxaSatisfacao || 0}%</S.MetricValue>
              <S.MetricDetail>
                Pesquisa pacientes
              </S.MetricDetail>
              <S.StatusBadge status={getStatusAtendimento(dados.metricas?.taxaSatisfacao || 0)}>
                {getStatusText(getStatusAtendimento(dados.metricas?.taxaSatisfacao || 0))}
              </S.StatusBadge>
            </S.MetricCard>
          </S.MetricsGrid>

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