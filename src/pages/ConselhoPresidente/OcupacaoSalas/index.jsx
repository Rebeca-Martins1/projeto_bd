import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

export default function OcupacaoSalas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');

  const handleExport = (format) => {
    alert(`Exportando relatório de ocupação de salas em formato ${format.toUpperCase()}...`);
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
            <h1>Ocupação de Salas</h1>
            <p>Relatório detalhado da utilização das salas hospitalares</p>
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
            
            <label>Tipo de Sala:</label>
            <S.Select>
              <option value="todas">Todas as Salas</option>
              <option value="consultorios">Consultórios</option>
              <option value="cirurgia">Salas de Cirurgia</option>
              <option value="exames">Salas de Exame</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>Consultórios</S.MetricTitle>
              <S.MetricValue>91%</S.MetricValue>
              <S.MetricTrend trend="up">+3%</S.MetricTrend>
              <S.MetricDetail>45/49 consultórios ocupados</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas de Cirurgia</S.MetricTitle>
              <S.MetricValue>78%</S.MetricValue>
              <S.MetricTrend trend="neutral">0%</S.MetricTrend>
              <S.MetricDetail>14/18 salas ocupadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Salas de Exame</S.MetricTitle>
              <S.MetricValue>85%</S.MetricValue>
              <S.MetricTrend trend="up">+2%</S.MetricTrend>
              <S.MetricDetail>34/40 salas ocupadas</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>UTI</S.MetricTitle>
              <S.MetricValue>92%</S.MetricValue>
              <S.MetricTrend trend="up">+1%</S.MetricTrend>
              <S.MetricDetail>12/13 salas ocupadas</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Ocupação por Especialidade</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Barras - Comparativo por Especialidade
              </S.ChartPlaceholder>
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Distribuição por Turno</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Pizza - Manhã vs Tarde vs Noite
              </S.ChartPlaceholder>
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela Detalhada */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Especialidade</S.TableTitle>
            <S.Table>
              <thead>
                <tr>
                  <th>Especialidade</th>
                  <th>Salas Totais</th>
                  <th>Salas Ocupadas</th>
                  <th>Ocupação</th>
                  <th>Turno Mais Ocupado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cardiologia</td>
                  <td>8</td>
                  <td>7</td>
                  <td>88%</td>
                  <td>Manhã</td>
                </tr>
                <tr>
                  <td>Ortopedia</td>
                  <td>6</td>
                  <td>6</td>
                  <td>100%</td>
                  <td>Tarde</td>
                </tr>
                <tr>
                  <td>Pediatria</td>
                  <td>5</td>
                  <td>4</td>
                  <td>80%</td>
                  <td>Manhã</td>
                </tr>
                <tr>
                  <td>Dermatologia</td>
                  <td>4</td>
                  <td>4</td>
                  <td>100%</td>
                  <td>Tarde</td>
                </tr>
                <tr>
                  <td>Neurologia</td>
                  <td>3</td>
                  <td>3</td>
                  <td>100%</td>
                  <td>Manhã</td>
                </tr>
                <tr>
                  <td>Oftalmologia</td>
                  <td>4</td>
                  <td>3</td>
                  <td>75%</td>
                  <td>Tarde</td>
                </tr>
              </tbody>
            </S.Table>
          </S.TableSection>

          {/* Salas de Cirurgia */}
          <S.TableSection>
            <S.TableTitle>Salas de Cirurgia - Agendamentos</S.TableTitle>
            <S.Table>
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Capacidade</th>
                  <th>Cirurgias Hoje</th>
                  <th>Status</th>
                  <th>Próxima Cirurgia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CIR-01</td>
                  <td>Grande</td>
                  <td>3/4</td>
                  <td><S.StatusBadge status="ocupada">Ocupada</S.StatusBadge></td>
                  <td>14:30 - Cardíaca</td>
                </tr>
                <tr>
                  <td>CIR-02</td>
                  <td>Média</td>
                  <td>2/3</td>
                  <td><S.StatusBadge status="disponivel">Disponível</S.StatusBadge></td>
                  <td>15:00 - Ortopédica</td>
                </tr>
                <tr>
                  <td>CIR-03</td>
                  <td>Pequena</td>
                  <td>1/2</td>
                  <td><S.StatusBadge status="manutencao">Manutenção</S.StatusBadge></td>
                  <td>16:00 - Plástica</td>
                </tr>
                <tr>
                  <td>CIR-04</td>
                  <td>Grande</td>
                  <td>4/4</td>
                  <td><S.StatusBadge status="ocupada">Ocupada</S.StatusBadge></td>
                  <td>17:00 - Neurológica</td>
                </tr>
              </tbody>
            </S.Table>
          </S.TableSection>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}
