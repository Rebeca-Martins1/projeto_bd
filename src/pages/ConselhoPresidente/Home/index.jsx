import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import axios from "axios";
import { 
  Activity, 
  BedDouble, 
  Building2, 
  ClipboardList, 
  Users, 
  UserCheck, 
  Download, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

function ReportCard({ icon, title, description, onClick, loading }) {
  return (
    <S.ReportCard onClick={onClick} disabled={loading}>
      <S.CardHeader>
        {React.createElement(icon)}
        <h3>{title}</h3>
        {loading && <S.LoadingSpinner />}
      </S.CardHeader>
      <S.CardContent>
        <p>{description}</p>
        <S.ActionButton>
          Ir para Seção
          <ArrowRight size={16} />
        </S.ActionButton>
      </S.CardContent>
    </S.ReportCard>
  );
}

export default function HomeConselhoPresidente() {
  const [periodo, setPeriodo] = useState('mes');
  const [visualizacao, setVisualizacao] = useState('grafico');
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [periodo]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/dashboard?periodo=${periodo}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      alert("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conselho-presidente/export?format=${format}&periodo=${periodo}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorios-${periodo}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatórios");
    }
  };

  const reportCards = [
    {
      type: "ocupacaoleitos",
      icon: BedDouble,
      title: "OCUPAÇÃO DE LEITOS",
      description: `UTI: ${dashboardData.ocupacaoLeitos?.uti?.ocupados || 0}/${dashboardData.ocupacaoLeitos?.uti?.total || 0} | Enfermaria: ${dashboardData.ocupacaoLeitos?.enfermaria?.ocupados || 0}/${dashboardData.ocupacaoLeitos?.enfermaria?.total || 0}`
    },
    {
      type: "ocupacaosalas",
      icon: Building2,
      title: "OCUPAÇÃO DE SALAS",
      description: `Consultórios: ${dashboardData.ocupacaoSalas?.consultorios?.ocupados || 0}/${dashboardData.ocupacaoSalas?.consultorios?.total || 0} | Cirurgia: ${dashboardData.ocupacaoSalas?.cirurgia?.ocupados || 0}/${dashboardData.ocupacaoSalas?.cirurgia?.total || 0}`
    },
    {
      type: "atividademedica",
      icon: UserCheck,
      title: "ATIVIDADE MÉDICA",
      description: `Consultas: ${dashboardData.atividadeMedica?.totalConsultas || 0} | Médicos Ativos: ${dashboardData.atividadeMedica?.medicosAtivos || 0}`
    },
    {
      type: "atividadecirurgica",
      icon: Activity,
      title: "ATIVIDADE CIRÚRGICA",
      description: `Cirurgias: ${dashboardData.atividadeCirurgica?.total || 0} | Aprovadas: ${dashboardData.atividadeCirurgica?.aprovadas || 0} | Pendentes: ${dashboardData.atividadeCirurgica?.pendentes || 0}`
    },
    {
      type: "recursoshumanos",
      icon: Users,
      title: "RECURSOS HUMANOS",
      description: `Médicos: ${dashboardData.recursosHumanos?.totalMedicos || 0} | Enfermeiros: ${dashboardData.recursosHumanos?.totalEnfermeiros || 0} | Plantões: ${dashboardData.recursosHumanos?.plantoesAtivos || 0}`
    },
    {
      type: "historicopacientes",
      icon: ClipboardList,
      title: "PACIENTES",
      description: `Total: ${dashboardData.pacientes?.total || 0} | Internados: ${dashboardData.pacientes?.internados || 0} | Alta: ${dashboardData.pacientes?.alta || 0}`
    }
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        <Header />

        <S.MainContent>
          <S.PageHeader>
            <h1>Painel de Relatórios Gerenciais</h1>
            <p>Dados em tempo real do sistema hospitalar</p>
            {loading && <S.LoadingMessage>Carregando dados...</S.LoadingMessage>}
          </S.PageHeader>

          <S.FilterBar>
            <S.FilterGroup>
              <label>Período:</label>
              <S.Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="trimestre">Último Trimestre</option>
                <option value="ano">Último Ano</option>
              </S.Select>
              
              <label>Visualização:</label>
              <S.Select value={visualizacao} onChange={(e) => setVisualizacao(e.target.value)}>
                <option value="grafico">Gráficos</option>
                <option value="tabela">Tabelas</option>
                <option value="ambos">Ambos</option>
              </S.Select>
            </S.FilterGroup>

            <S.ExportButtons>
              <S.ExportButton variant="secondary" onClick={() => handleExport('pdf')}>
                <FileText size={16} />
                PDF
              </S.ExportButton>
              <S.ExportButton variant="secondary" onClick={() => handleExport('excel')}>
                <Download size={16} />
                Excel
              </S.ExportButton>
            </S.ExportButtons>
          </S.FilterBar>

          <S.ReportGrid>
            {reportCards.map((card) => (
              <ReportCard 
                key={card.type}
                icon={card.icon} 
                title={card.title}
                description={card.description}
                loading={loading}
                onClick={() => handleCardClick(`/${card.type}`)}
              />
            ))}
          </S.ReportGrid>

          {/* Resumo Estatístico */}
          {!loading && (
            <S.StatsContainer>
              <S.StatsTitle>Resumo Estatístico</S.StatsTitle>
              <S.StatsGrid>
                <S.StatCard>
                  <S.StatNumber>{dashboardData.resumo?.taxaOcupacaoLeitos || 0}%</S.StatNumber>
                  <S.StatLabel>Taxa de Ocupação de Leitos</S.StatLabel>
                </S.StatCard>
                <S.StatCard>
                  <S.StatNumber>{dashboardData.resumo?.mediaConsultasDia || 0}</S.StatNumber>
                  <S.StatLabel>Média Consultas/Dia</S.StatLabel>
                </S.StatCard>
                <S.StatCard>
                  <S.StatNumber>{dashboardData.resumo?.taxaAprovacaoCirurgias || 0}%</S.StatNumber>
                  <S.StatLabel>Taxa Aprovação Cirurgias</S.StatLabel>
                </S.StatCard>
                <S.StatCard>
                  <S.StatNumber>{dashboardData.resumo?.tempoMedioPermanencia || 0}d</S.StatNumber>
                  <S.StatLabel>Tempo Médio Permanência</S.StatLabel>
                </S.StatCard>
              </S.StatsGrid>
            </S.StatsContainer>
          )}
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}