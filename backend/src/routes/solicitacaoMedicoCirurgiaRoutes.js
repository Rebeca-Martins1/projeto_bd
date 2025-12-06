import express from "express";
import { 
  listarMedicos, 
  listarEnfermeiros, 
  listarSalas,
  listarLeitos,
  criarSolicitacaoCirurgia 
} from "../controllers/solicitacaoMedicoCirurgiaController.js";

const router = express.Router();

router.get("/medicos", listarMedicos);
router.get("/enfermeiros", listarEnfermeiros);
router.get("/salas", listarSalas);
router.get("/leitos", listarLeitos);
router.post("/solicitar", criarSolicitacaoCirurgia);

export default router;