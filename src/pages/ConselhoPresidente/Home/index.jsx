import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
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

function ReportCard({ icon, title, description, onClick }) {
  return (
    <S.ReportCard onClick={onClick}>
      <S.CardHeader>
        {React.createElement(icon)}
        <h3>{title}</h3>
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
  const navigate = useNavigate();

  const handleExport = (format) => {
    alert(`Exportando relatórios em formato ${format.toUpperCase()}...`);
  };

  const reportCards = [
    {
      type: "ocupacaoleitos",
      icon: BedDouble,
      title: "OCUPAÇÃO DE LEITOS",
      description: "Análise detalhada da ocupação de UTI e enfermaria"
    },
    {
      type: "ocupacaosalas",
      icon: Building2,
      title: "OCUPAÇÃO DE SALAS",
      description: "Utilização de consultórios e salas de cirurgia"
    },
    {
      type: "atividademedica",
      icon: UserCheck,
      title: "ATIVIDADE MÉDICA",
      description: "Consultas, especialidades e tempo médio"
    },
    {
      type: "atividadecirurgica",
      icon: Activity,
      title: "ATIVIDADE CIRÚRGICA",
      description: "Cirurgias realizadas e taxas de aprovação"
    },
    {
      type: "recursoshumanos",
      icon: Users,
      title: "RECURSOS HUMANOS",
      description: "Horas trabalhadas e distribuição de plantões"
    },
    {
      type: "pacientes",
      icon: ClipboardList,
      title: "PACIENTES",
      description: "Total atendido e métricas de permanência"
    }
  ];

  const handleCardClick = (route) => {
    console.log("Navegando para:", route); // Para debug
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
            <p>Clique em qualquer card para visualizar relatórios detalhados</p>
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
                onClick={() => handleCardClick(`/${card.type}`)}
              />
            ))}
          </S.ReportGrid>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}