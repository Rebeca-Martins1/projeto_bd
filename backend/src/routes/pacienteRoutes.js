import express from "express"; // Importa o Express usando ESM
const router = express.Router(); 

// Importa todas as funções do controller
import * as pacienteController from "../controllers/pacienteController.js"; 

// Rota de Cadastro
router.post("/", pacienteController.cadastrarPaciente);

// Rotas de Cirurgias
router.get("/:cpf/cirurgias", pacienteController.getMinhasCirurgias);

// Rotas de Perfil
router.get("/:cpf/perfil", pacienteController.getPerfil);
router.put("/:cpf/perfil", pacienteController.updatePerfil);

// ✅ NOVA ROTA: Visualizar Consultas (Adicione esta linha)
router.get("/:cpf/consultas", pacienteController.getMinhasConsultas);

export default router;