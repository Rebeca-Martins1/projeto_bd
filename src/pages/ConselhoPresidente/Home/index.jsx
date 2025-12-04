import React from "react";
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
  ArrowRight
} from "lucide-react";

function ReportCard({ icon, title, description, path }) {
  const navigate = useNavigate();
  
  return (
    <S.ReportCard onClick={() => navigate(path)}>
      <S.CardHeader>
        {React.createElement(icon)}
        <h3>{title}</h3>
      </S.CardHeader>
      <S.CardContent>
        <p>{description}</p>
        <S.ActionButton>
          Ir pra seção
          <ArrowRight size={16} />
        </S.ActionButton>
      </S.CardContent>
    </S.ReportCard>
  );
}

export default function HomeConselhoPresidente() {
  const reportCards = [
    {
      type: "ocupacaoleitos",
      icon: BedDouble,
      title: "OCUPAÇÃO DE LEITOS",
      description: "Relatório completo de ocupação de leitos UTI, enfermaria e observação",
      path: "/ocupacaoleitos"
    },
    {
      type: "ocupacaosalas",
      icon: Building2,
      title: "OCUPAÇÃO DE SALAS",
      description: "Utilização de consultórios e salas de cirurgia e procedimentos",
      path: "/ocupacaosalas"
    },
    {
      type: "atividademedica",
      icon: UserCheck,
      title: "ATIVIDADE MÉDICA",
      description: "Consultas realizadas e produtividade médica por especialidade",
      path: "/atividademedica"
    },
    {
      type: "atividadecirurgica",
      icon: Activity,
      title: "ATIVIDADE CIRÚRGICA",
      description: "Cirurgias programadas, realizadas e taxas de aprovação",
      path: "/atividadecirurgica"
    },
    {
      type: "recursoshumanos",
      icon: Users,
      title: "RECURSOS HUMANOS",
      description: "Quadro de funcionários, plantões e escalas de serviço",
      path: "/recursoshumanos"
    },
    {
      type: "historicopacientes",
      icon: ClipboardList,
      title: "HISTÓRICO PACIENTES",
      description: "Internações, altas e movimentação de pacientes no período",
      path: "/historicopacientes"
    }
  ];

  // Obtém o usuário do localStorage (assumindo mesma estrutura que o primeiro código)
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  return (
    <>
      <S.GlobalStyles />
      <S.ConselhoPortalContainer>
        <Header />

        <S.MainContent>
          {/* Seção de boas-vindas personalizada - ESTILO ATUALIZADO */}
          <S.WelcomeMessage>
            <h1>BEM-VINDO, {usuario?.nome || "PRESIDENTE"}</h1>
            <p className="subtitle">Portal de Relatórios Gerenciais</p>
          </S.WelcomeMessage>

          <S.ReportGrid>
            {reportCards.map((card) => (
              <ReportCard 
                key={card.type}
                icon={card.icon} 
                title={card.title}
                description={card.description}
                path={card.path}
              />
            ))}
          </S.ReportGrid>
        </S.MainContent>

        <Footer />
      </S.ConselhoPortalContainer>
    </>
  );
}