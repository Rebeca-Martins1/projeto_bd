import express from "express";
import { 
    cadastrarEnfermeiro,
    getPerfil,
    updatePerfil,
    getMinhasCirurgias, // Certifique-se que essa função existe no controller
    getLeitos,
    assumirLeito,
    registrarPlantao,
    getProcedimentosDia 
} from "../controllers/enfermeiroController.js";

const router = express.Router();

// 1. Rota de Cadastro
router.post("/", cadastrarEnfermeiro);

// 2. Perfil
router.get("/:cpf/perfil", getPerfil);
router.put("/:cpf/perfil", updatePerfil);

// 3. Rota para tela 'MinhasCirurgias' (CORRIGIDA)
// O frontend chama: /enfermeiro/:cpf/escala
router.get("/:cpf/escala", getMinhasCirurgias); 

// 4. Leitos
router.get("/leitos", getLeitos);
router.put("/:cpf/assumir-leito", assumirLeito);

// 5. Plantão
router.post("/plantao/cadastrar", registrarPlantao); 

// 6. Procedimentos do dia (Geral)
router.get("/procedimentos/dia", getProcedimentosDia);

export default router;