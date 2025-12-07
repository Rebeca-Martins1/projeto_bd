import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/index'
import Cadastro from './pages/cadastro'
import HomePaciente from './pages/Paciente/Home/index'
import HomeMedico from './pages/Medico/Home/page'
import HomeAdm from './pages/Adm/Home/index'
import CadastroLeitos from './pages/Adm/Cadastro_Leitos'
import CadastroSalas from './pages/Adm/Cadastro_Salas'
import DesativarLeitos from './pages/Adm/Desativar_leitos'
import DesativarSalas from './pages/Adm/Desativar_salas'
import DesativarFuncionarios from './pages/Adm/Desativar_funcionarios'
import Cadastroadmcp from './pages/Adm/CADASTRAADM_CP'
import Perfiladm from './pages/Adm/Perfil'
import Solicitacao from './pages/Adm/Solicitacao'
import MarcarConsulta from './pages/Paciente/MarcarConsulta/index'
import MyGlobalStyles from './styles/globalStyles'
import CadastroProfissional from './pages/Adm/Cadastro_medico_enfermeiro/index'
import AgendarCirurgia from './pages/Medico/AgendarCirurgia/page'
import MinhasCirurgias from './pages/Medico/MinhasCirurgias/page' 
import MinhasCirurgiasPaciente from './pages/Paciente/MinhasCirurgias/MinhasCirurgias.jsx'  
import MinhasConsultasPaciente from './pages/Paciente/MinhasConsultas/page.jsx'  
import MinhasConsultas from './pages/Medico/MinhasConsultas/page'
import ConselhoPresidente from './pages/ConselhoPresidente/Home/index'
import OcupacaoSalas from './pages/ConselhoPresidente/OcupacaoSalas/index'
import OcupacaoLeitos from './pages/ConselhoPresidente/OcupacaoLeitos/index'
import AtividadeMedica from './pages/ConselhoPresidente/AtividadeMedica/index'
import AtividadeCirurgica from './pages/ConselhoPresidente/AtividadeCirurgica/index'
import RecursosHumanos from './pages/ConselhoPresidente/RecursosHumanos/index'
import HistoricoPacientes from './pages/ConselhoPresidente/HistoricoPacientes/index'
import HomeEnfermeiro from './pages/Enfermeiro/Home/index'
import Plantao from './pages/Enfermeiro/Plantao/index'
import PerfilPaciente from './pages/Paciente/PerfilPaciente/index'
import PerfilMedico from './pages/Medico/Perfil/page'
import EditarPerfil from './pages/Enfermeiro/EditarPerfil'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyGlobalStyles />
    <Routes>
      <Route path="/" element={< HomeEnfermeiro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      {/* 🚀 ROTAS DO PACIENTE */}
      <Route path="/homepaciente" element={<HomePaciente/>} />
      <Route path="/marcarconsulta" element={<MarcarConsulta/>} />
      <Route path="/perfilpaciente" element={<PerfilPaciente/>} />
      <Route path="/minhascirurgiaspaciente" element={<MinhasCirurgiasPaciente/>} /> 
      <Route path="/minhasconsultaspaciente" element={<MinhasConsultasPaciente/>} />
      {/* 🧑‍⚕️ ROTAS DO MÉDICO */}
      <Route path="/homemedico" element={<HomeMedico/>} />
      <Route path="/agendarcirurgia" element={<AgendarCirurgia/>} />
      <Route path="/minhascirurgias" element={<MinhasCirurgias/>} />
      <Route path="/minhasconsultas" element={<MinhasConsultas/>} />
      <Route path="/perfilmedico" element={<PerfilMedico/>} />

      {/* 👩‍⚕️ ROTAS DO ENFERMEIRO */}
      <Route path="/homeenfermeiro" element={<HomeEnfermeiro/>} />
      <Route path="/plantao" element={<Plantao/>} />
      <Route path="/editarperfil" element={<EditarPerfil/>} />

      {/* 💻 ROTAS DO ADMINISTRADOR */}
      <Route path="/homeadm" element={<HomeAdm/>} />
      {/* CORRIGIDO: Rota para o cadastro de profissionais */}
      <Route path="/cadastro_profissionais" element={<CadastroProfissional/>} />
      <Route path="/cadastro_leitos" element={<CadastroLeitos/>} />
      <Route path="/cadastro_salas" element={<CadastroSalas/>} />
      <Route path="/desativar_leitos" element={<DesativarLeitos/>} />
      <Route path="/desativar_salas" element={<DesativarSalas/>} />
      <Route path="/desativar_funcionarios" element={<DesativarFuncionarios/>} />
      <Route path="/perfiladm" element={<Perfiladm/>}/>
      <Route path="/solicitacao" element={<Solicitacao/>}/>

      {/* 👑 ROTAS DO CONSELHO PRESIDENTE */}
      <Route path="/conselhopresidente" element={<ConselhoPresidente/>} />
      <Route path="/ocupacaoleitos" element={<OcupacaoLeitos/>} />
      <Route path="/ocupacaosalas" element={<OcupacaoSalas/>} />
      <Route path="/atividademedica" element={<AtividadeMedica/>} />
      <Route path="/atividadecirurgica" element={<AtividadeCirurgica/>} />
      <Route path="/recursoshumanos" element={<RecursosHumanos/>} />
      <Route path="/historicopacientes" element={<HistoricoPacientes/>} />

    </Routes>
  </BrowserRouter>
)