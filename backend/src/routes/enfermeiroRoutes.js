import express from "express";
import { 
    cadastrarEnfermeiro,
    getPerfil,
    updatePerfil,
    getMinhasCirurgias,
    getLeitos,
    assumirLeito,
    registrarPlantao,
    getProcedimentosDia // <--- 1. Importe a nova função aqui
} from "../controllers/enfermeiroController.js";

const router = express.Router();

// 1. Rota de Cadastro (Login/Registro)
router.post("/", cadastrarEnfermeiro);

// 2. Rotas para telas 'Home' e 'EditarPerfil'
router.get("/:cpf/perfil", getPerfil);      // Busca dados do perfil
router.put("/:cpf/perfil", updatePerfil);   // Atualiza dados do perfil

// 3. Rota para tela 'MinhasCirurgias'
router.get("/:cpf/cirurgias", getMinhasCirurgias); 

// 4. Rotas para tela 'Leitos'
router.get("/leitos", getLeitos);                 // Mapa geral dos leitos
router.put("/:cpf/assumir-leito", assumirLeito);  // Assumir responsabilidade

// 5. Rotas para tela 'Plantao'
// Ajustado para bater com o axios.post do seu frontend
router.post("/plantao/cadastrar", registrarPlantao); 

// 6. NOVA ROTA: Lista os procedimentos (cirurgias) do dia
// O frontend chama: axios.get(".../procedimentos/dia")
router.get("/procedimentos/dia", getProcedimentosDia);

export default router;