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
import Cirurgiamedico from './pages/Medico/AgendarCirurgia/page'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyGlobalStyles />
    <Routes>
      <Route path="/" element={< Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/homepaciente" element={<HomePaciente/>} />
      <Route path="/marcarconsulta" element={<MarcarConsulta/>} />
      <Route path="/homemedico" element={<HomeMedico/>} />
      <Route path="/homeadm" element={<HomeAdm/>} />
    </Routes>
  </BrowserRouter>
)