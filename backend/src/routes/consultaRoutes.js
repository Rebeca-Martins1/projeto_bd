import express from "express";
import { 
  listarEspecialidades, 
  listarMedicosPorEspecialidade, 
  agendarConsulta 
} from "../controllers/consultaController.js"; // <--- O erro dizia que agendarConsulta não vinha daqui

const router = express.Router();

router.get("/especialidades", listarEspecialidades);
router.get("/medicos/:especialidade", listarMedicosPorEspecialidade);
router.post("/", agendarConsulta); 

export default router;