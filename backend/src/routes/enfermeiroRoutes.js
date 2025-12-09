import express from "express";
import { 
    cadastrarEnfermeiro,
    getPerfil,
    updatePerfil,
    getMinhasCirurgias,
    getLeitos,
    assumirLeito,
    registrarPlantao
} from "../controllers/enfermeiroController.js";

const router = express.Router();

// 1. Rota de Cadastro (Login/Registro)
router.post("/", cadastrarEnfermeiro);

// 2. Rotas para telas 'Home' e 'EditarPerfil'
router.get("/:cpf/perfil", getPerfil);      // Busca dados para preencher a Home e o formulário de edição
router.put("/:cpf/perfil", updatePerfil);   // Salva as alterações do perfil

// 3. Rota para tela 'MinhasCirurgias'
router.get("/:cpf/cirurgias", getMinhasCirurgias); // Lista cirurgias onde o enfermeiro foi alocado

// 4. Rotas para tela 'Leitos'
router.get("/leitos", getLeitos);                  // Lista todos os leitos do hospital (mapa geral)
router.put("/:cpf/assumir-leito", assumirLeito);   // O enfermeiro clica para se responsabilizar por um leito

// 5. Rota para tela 'Plantao'
router.put("/:cpf/plantao", registrarPlantao);     // Atualiza horário de início/fim e disponibilidade

export default router;