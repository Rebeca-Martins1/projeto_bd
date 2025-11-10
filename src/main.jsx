import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/index'
import Cadastro from './pages/cadastro'
import HomePaciente from './pages/Paciente/Home/index'
import HomeMedico from './pages/Medico/Home/page'
import HomeAdm from './pages/Adm/Home/index'
import MarcarConsulta from './pages/Paciente/MarcarConsulta/index'
import EditarPerfilPaciente from './pages/Paciente/EditarPerfil'
import MyGlobalStyles from './styles/globalStyles'
import CadastroProfissional from './pages/Adm/Cadastro_medico_enfermeiro/index'
import AgendarCirurgia from './pages/Medico/AgendarCirurgia/page'


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyGlobalStyles />
    <Routes>
      <Route path="/" element={< Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      <Route path="/homepaciente" element={<HomePaciente/>} />
      <Route path="/marcarconsulta" element={<MarcarConsulta/>} />
      <Route path="/editarperfil" element={<EditarPerfilPaciente/>} />

      <Route path="/homemedico" element={<HomeMedico/>} />
      <Route path="/agendarcirurgia" element={<AgendarCirurgia/>} />

      <Route path="/homeadm" element={<HomeAdm/>} />
      <Route path="/cadastro_medico_paciente" element={<CadastroProfissional/>} />

    </Routes>
  </BrowserRouter>
)