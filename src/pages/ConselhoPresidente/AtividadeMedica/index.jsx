import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

export default function AtividadeMedica() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');

  const handleExport = (format) => {
    alert(`Exportando relatório de atividade médica em formato ${format.toUpperCase()}...`);
  };

  return (
    <div>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        {/* Header */}
        <S.Header>
          <S.BackButton onClick={() => navigate("/conselho")}>
            ← Voltar para Painel
          </S.BackButton>
          <S.Title>
            <h1>Atividade Médica</h1>
            <p>Relatório detalhado das consultas e atendimentos médicos</p>
          </S.Title>
          <S.ExportButtons>
            <S.ExportBtn onClick={() => handleExport('pdf')}>
              Exportar PDF
            </S.ExportBtn>
            <S.ExportBtn onClick={() => handleExport('excel')}>
              Exportar Excel
            </S.ExportBtn>
          </S.ExportButtons>
        </S.Header>

        {/* Filtros */}
        <S.FilterSection>
          <S.FilterGroup>
            <label>Período:</label>
            <S.Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </S.Select>
            
            <label>Especialidade:</label>
            <S.Select>
              <option value="todas">Todas as Especialidades</option>
              <option value="cardiologia">Cardiologia</option>
              <option value="ortopedia">Ortopedia</option>
              <option value="pediatria">Pediatria</option>
              <option value="dermatologia">Dermatologia</option>
            </S.Select>

            <label>Médico:</label>
            <S.Select>
              <option value="todos">Todos os Médicos</option>
              <option value="joao">Dr. João Silva</option>
              <option value="maria">Dra. Maria Souza</option>
              <option value="paulo">Dr. Paulo Lima</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Total de Consultas</S.MetricTitle>
              <S.MetricValue>1.247</S.MetricValue>
              <S.MetricTrend trend="up">+8%</S.MetricTrend>
              <S.MetricDetail>Este mês vs mês anterior</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Tempo Médio</S.MetricTitle>
              <S.MetricValue>32 min</S.MetricValue>
              <S.MetricTrend trend="down">-2 min</S.MetricTrend>
              <S.MetricDetail>Por consulta</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Comparecimento</S.MetricTitle>
              <S.MetricValue>94%</S.MetricValue>
              <S.MetricTrend trend="up">+3%</S.MetricTrend>
              <S.MetricDetail>Consultas realizadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Médicos Ativos</S.MetricTitle>
              <S.MetricValue>28</S.MetricValue>
              <S.MetricTrend trend="neutral">0</S.MetricTrend>
              <S.MetricDetail>Este mês</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Consultas por Especialidade</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Pizza - Especialidades Mais Requisitadas
              </S.ChartPlaceholder>
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Evolução Mensal</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Linha - Tendência de Consultas
              </S.ChartPlaceholder>
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela de Especialidades */}
          <S.TableSection>
            <S.TableTitle>Desempenho por Especialidade</S.TableTitle>
            <S.Table>
              <thead>
                <tr>
                  <th>Especialidade</th>
                  <th>Total Consultas</th>
                  <th>Tempo Médio</th>
                  <th>Taxa Comparecimento</th>
                  <th>Crescimento</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cardiologia</strong></td>
                  <td>312</td>
                  <td>45 min</td>
                  <td>96%</td>
                  <td><S.TrendBadge trend="up">+12%</S.TrendBadge></td>
                </tr>
                <tr>
                  <td><strong>Ortopedia</strong></td>
                  <td>289</td>
                  <td>30 min</td>
                  <td>92%</td>
                  <td><S.TrendBadge trend="up">+8%</S.TrendBadge></td>
                </tr>
                <tr>
                  <td><strong>Pediatria</strong></td>
                  <td>275</td>
                  <td>25 min</td>
                  <td>89%</td>
                  <td><S.TrendBadge trend="down">-5%</S.TrendBadge></td>
                </tr>
                <tr>
                  <td><strong>Dermatologia</strong></td>
                  <td>198</td>
                  <td>20 min</td>
                  <td>95%</td>
                  <td><S.TrendBadge trend="up">+15%</S.TrendBadge></td>
                </tr>
                <tr>
                  <td><strong>Neurologia</strong></td>
                  <td>173</td>
                  <td>50 min</td>
                  <td>94%</td>
                  <td><S.TrendBadge trend="up">+6%</S.TrendBadge></td>
                </tr>
              </tbody>
            </S.Table>
          </S.TableSection>

          {/* Top Médicos */}
          <S.TableSection>
            <S.TableTitle>Top 10 Médicos - Maior Volume</S.TableTitle>
            <S.Table>
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Especialidade</th>
                  <th>Consultas</th>
                  <th>Tempo Médio</th>
                  <th>Avaliação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dr. João Silva</strong></td>
                  <td>Cardiologia</td>
                  <td>156</td>
                  <td>45 min</td>
                  <td>4.9 ★</td>
                  <td><S.StatusBadge status="ativo">Ativo</S.StatusBadge></td>
                </tr>
                <tr>
                  <td><strong>Dra. Maria Souza</strong></td>
                  <td>Ortopedia</td>
                  <td>142</td>
                  <td>35 min</td>
                  <td>4.8 ★</td>
                  <td><S.StatusBadge status="ativo">Ativo</S.StatusBadge></td>
                </tr>
                <tr>
                  <td><strong>Dr. Paulo Lima</strong></td>
                  <td>Pediatria</td>
                  <td>138</td>
                  <td>25 min</td>
                  <td>4.7 ★</td>
                  <td><S.StatusBadge status="ativo">Ativo</S.StatusBadge></td>
                </tr>
                <tr>
                  <td><strong>Dra. Ana Costa</strong></td>
                  <td>Dermatologia</td>
                  <td>125</td>
                  <td>20 min</td>
                  <td>4.9 ★</td>
                  <td><S.StatusBadge status="ferias">Férias</S.StatusBadge></td>
                </tr>
                <tr>
                  <td><strong>Dr. Carlos Santos</strong></td>
                  <td>Neurologia</td>
                  <td>118</td>
                  <td>50 min</td>
                  <td>4.6 ★</td>
                  <td><S.StatusBadge status="ativo">Ativo</S.StatusBadge></td>
                </tr>
                <tr>
                  <td><strong>Dra. Fernanda Oliveira</strong></td>
                  <td>Cardiologia</td>
                  <td>112</td>
                  <td>40 min</td>
                  <td>4.8 ★</td>
                  <td><S.StatusBadge status="ativo">Ativo</S.StatusBadge></td>
                </tr>
              </tbody>
            </S.Table>
          </S.TableSection>

          {/* Métricas de Tempo */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Horário de Pico</S.MetricTitle>
              <S.MetricValue>09:00 - 11:00</S.MetricValue>
              <S.MetricDetail>Manhã</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Taxa de Remarcação</S.MetricTitle>
              <S.MetricValue>8%</S.MetricValue>
              <S.MetricTrend trend="down">-2%</S.MetricTrend>
              <S.MetricDetail>Este mês</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Consultas de Retorno</S.MetricTitle>
              <S.MetricValue>42%</S.MetricValue>
              <S.MetricTrend trend="up">+5%</S.MetricTrend>
              <S.MetricDetail>Do total</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Novos Pacientes</S.MetricTitle>
              <S.MetricValue>723</S.MetricValue>
              <S.MetricTrend trend="up">+12%</S.MetricTrend>
              <S.MetricDetail>Este mês</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}
