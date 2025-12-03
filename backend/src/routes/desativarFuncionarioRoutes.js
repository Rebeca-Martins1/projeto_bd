import express from "express";
import { listarMedicos, listarEnfermeiros, desativarMedico, desativarEnfermeiro, ativarMedico, ativarEnfermeiro } from "../controllers/desativarFuncionariosController.js";

const router = express.Router();

router.get("/listarMedicos", listarMedicos);
router.get("/listarEnfermeiros", listarEnfermeiros);

router.put("/medico/desativar/:cpf", desativarMedico);
router.put("/medico/ativar/:cpf", ativarMedico);

router.put("/enfermeiro/desativar/:cpf", desativarEnfermeiro);
router.put("/enfermeiro/ativar/:cpf", ativarEnfermeiro);
export default router;
