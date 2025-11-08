import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Cadastro from './pages/index'
import MyGlobalStyles from './styles/globalStyles'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyGlobalStyles />
    <Cadastro />
  </StrictMode>,
)
