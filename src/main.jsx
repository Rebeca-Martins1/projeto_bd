import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/index'
import Cadastro from './pages/cadastro'
import HomePaciente from './pages/Paciente/Home/index'
import HomeMedico from './pages/Medico/Home/page'
import HomeAdm from './pages/Adm/Home/index'
import MarcarConsulta from './pages/Paciente/MarcarConsulta/index'
import MyGlobalStyles from './styles/globalStyles'
import CadastroProfissional from './pages/Adm/Cadastro_medico_enfermeiro/index'
import CadastroLeito from './pages/Adm/Cadastro_Leitos/index'
import AgendarCirurgia from './pages/Medico/AgendarCirurgia/page'
import ConselhoPresidente from './pages/ConselhoPresidente/Home/index'
import OcupacaoSalas from './pages/ConselhoPresidente/OcupacaoSalas/index'
import OcupacaoLeitos from './pages/ConselhoPresidente/OcupacaoLeitos/index'
import AtividadeMedica from './pages/ConselhoPresidente/AtividadeMedica/index'
import HomeEnfermeiro from './pages/Enfermeiro/Home/index'
import Plantao from './pages/Enfermeiro/Plantao/index'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyGlobalStyles />
    <Routes>
      <Route path="/" element={< Plantao />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      <Route path="/homepaciente" element={<HomePaciente/>} />
      <Route path="/marcarconsulta" element={<MarcarConsulta/>} />

      <Route path="/homemedico" element={<HomeMedico/>} />
      <Route path="/agendarcirurgia" element={<AgendarCirurgia/>} />

      <Route path="/homeenfermeiro" element={<HomeEnfermeiro/>} />
      <Route path="/plantao" element={<Plantao/>} />

      <Route path="/homeadm" element={<HomeAdm/>} />
      <Route path="/cadastro_medico_paciente" element={<CadastroProfissional/>} />
      <Route path="/cadastro_leitos" element={<CadastroLeito/>} />

      <Route path="/conselho" element={<ConselhoPresidente/>} />
      <Route path="/ocupacaoleitos" element={<OcupacaoLeitos/>} />
      <Route path="/ocupacaosalas" element={<OcupacaoSalas/>} />
      <Route path="/atividademedica" element={<AtividadeMedica/>} />
    </Routes>
  </BrowserRouter>
)