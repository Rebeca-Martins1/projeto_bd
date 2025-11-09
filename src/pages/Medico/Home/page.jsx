import React from 'react';
import * as S from './styles';

const IconHeartPulse = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.35 1.05-4.5 2.73C10.85 4.05 9.26 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l.39.39.61.61L12 21l6-6-0.61-.61L17.61 14z" />
    <path d="M14.47 15.53l-1.47-1.47-1.47 1.47" />
  </svg>
);

const IconCalendarPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <line x1="12" x2="12" y1="15" y2="21" />
    <line x1="9" x2="15" y1="18" y2="18" />
  </svg>
);

const IconCalendarCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const IconClipboardList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

function ActionCard({ icon, title, description, buttonText }) {
  return (
    <S.ActionCardContainer>
      <S.ActionCardIcon>
        {React.createElement(icon)}
      </S.ActionCardIcon>
      <h3>{title}</h3>
      <p>{description}</p>
      <S.ActionCardButton>{buttonText}</S.ActionCardButton>
    </S.ActionCardContainer>
  );
}

export default function HomeMedico() {
  return (
    <>
      <S.GlobalStyles />
      <S.MedicoPortalContainer>
        <S.TopHeader>
          <S.TopHeaderContent>
            <S.Logo>
              <IconHeartPulse />
              <S.LogoTitle>Nome do Hospital</S.LogoTitle>
            </S.Logo>
          </S.TopHeaderContent>
        </S.TopHeader>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <S.MainContent>
          <S.WelcomeMessage>
            <h1>BEM-VINDO, [NOME DO MÉDICO]</h1>
            <p>Seu Portal Médico</p>
          </S.WelcomeMessage>

          <S.CardGrid>
            <ActionCard 
              icon={IconCalendarPlus}
              title="AGENDAR CIRURGIA"
              description="Programe novas intervenções com o médico"
              buttonText="IR PRA SESSÃO"
            />
            <ActionCard 
              icon={IconCalendarCheck}
              title="MINHAS CIRURGIAS"
              description="Visualize suas cirurgias agendadas e passadas"
              buttonText="IR PRA SESSÃO"
            />
            <ActionCard 
              icon={IconClipboardList}
              title="MINHAS CONSULTAS"
              description="Veja seus atendimentos e horários"
              buttonText="IR PRA SESSÃO"
            />
          </S.CardGrid>
        </S.MainContent>

        {/* --- RODAPÉ --- */}
        <S.Footer>
          <S.FooterGrid>
            <S.FooterCol>
              <h5>Sobre nós</h5>
              <p>Informações sobre o Hospital.</p>
            </S.FooterCol>
            
            <S.FooterCol>
              <h5>Informações para contato</h5>
              <ul>
                <li>Rua do Hospital</li>
                <li>Cidade, estado, cep</li>
                <li>Telefone</li>
                <li>email</li>
              </ul>
            </S.FooterCol>
          </S.FooterGrid>
        </S.Footer>
      </S.MedicoPortalContainer>
    </>
  );
}