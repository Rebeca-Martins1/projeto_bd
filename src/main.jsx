import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/index'
import Cadastro from './pages/cadastro'
import HomePaciente from './pages/Paciente/Home/index'
import MyGlobalStyles from './styles/globalStyles'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyGlobalStyles />
    <Routes>
      <Route path="/" element={<HomePaciente />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/homepaciente" element={<HomePaciente/>} />
    </Routes>
  </BrowserRouter>
)

