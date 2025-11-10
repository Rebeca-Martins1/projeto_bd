import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

export default function OcupacaoLeitos() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');

  const handleExport = (format) => {
    alert(`Exportando relatório de ocupação de leitos em formato ${format.toUpperCase()}...`);
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
            <h1>Ocupação de Leitos</h1>
            <p>Relatório detalhado da ocupação hospitalar</p>
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
            
            <label>Unidade:</label>
            <S.Select>
              <option value="todas">Todas as Unidades</option>
              <option value="uti">UTI</option>
              <option value="enfermaria">Enfermaria</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterSection>

        {/* Conteúdo Principal */}
        <S.MainContent>
          {/* Métricas Principais */}
          <S.MetricsGrid>
            <S.MetricCard>
              <S.MetricTitle>UTI</S.MetricTitle>
              <S.MetricValue>87%</S.MetricValue>
              <S.MetricTrend trend="up">+2%</S.MetricTrend>
              <S.MetricDetail>39/45 leitos ocupados</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Enfermaria</S.MetricTitle>
              <S.MetricValue>72%</S.MetricValue>
              <S.MetricTrend trend="down">-1%</S.MetricTrend>
              <S.MetricDetail>86/120 leitos ocupados</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Pediatria</S.MetricTitle>
              <S.MetricValue>65%</S.MetricValue>
              <S.MetricTrend trend="up">+5%</S.MetricTrend>
              <S.MetricDetail>23/35 leitos ocupados</S.MetricDetail>
            </S.MetricCard>

            <S.MetricCard>
              <S.MetricTitle>Obstetrícia</S.MetricTitle>
              <S.MetricValue>58%</S.MetricValue>
              <S.MetricTrend trend="neutral">0%</S.MetricTrend>
              <S.MetricDetail>15/25 leitos ocupados</S.MetricDetail>
            </S.MetricCard>
          </S.MetricsGrid>

          {/* Gráficos */}
          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartTitle>Tendência de Ocupação</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Linha - Evolução Mensal
              </S.ChartPlaceholder>
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartTitle>Distribuição por Unidade</S.ChartTitle>
              <S.ChartPlaceholder>
                Gráfico de Pizza - Percentual
              </S.ChartPlaceholder>
            </S.ChartCard>
          </S.ChartsGrid>

          {/* Tabela Detalhada */}
          <S.TableSection>
            <S.TableTitle>Detalhamento por Setor</S.TableTitle>
            <S.Table>
              <thead>
                <tr>
                  <th>Setor</th>
                  <th>Leitos Totais</th>
                  <th>Leitos Ocupados</th>
                  <th>Ocupação</th>
                  <th>Tendência</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>UTI Adulto</td>
                  <td>30</td>
                  <td>26</td>
                  <td>87%</td>
                  <td><S.TableTrend trend="up">+2%</S.TableTrend></td>
                </tr>
                <tr>
                  <td>UTI Pediátrica</td>
                  <td>15</td>
                  <td>13</td>
                  <td>87%</td>
                  <td><S.TableTrend trend="up">+1%</S.TableTrend></td>
                </tr>
                <tr>
                  <td>Enfermaria A</td>
                  <td>40</td>
                  <td>29</td>
                  <td>73%</td>
                  <td><S.TableTrend trend="down">-2%</S.TableTrend></td>
                </tr>
                <tr>
                  <td>Enfermaria B</td>
                  <td>40</td>
                  <td>30</td>
                  <td>75%</td>
                  <td><S.TableTrend trend="neutral">0%</S.TableTrend></td>
                </tr>
                <tr>
                  <td>Enfermaria C</td>
                  <td>40</td>
                  <td>27</td>
                  <td>68%</td>
                  <td><S.TableTrend trend="down">-3%</S.TableTrend></td>
                </tr>
              </tbody>
            </S.Table>
          </S.TableSection>
        </S.MainContent>
      </S.ConselhoPortalContainer>
    </div>
  );
}