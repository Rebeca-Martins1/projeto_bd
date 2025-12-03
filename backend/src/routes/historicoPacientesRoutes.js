import express from "express";
import { historicoPacientes, exportPacientes } from "../controllers/historicoPacientesController.js";

const router = express.Router();

// Rota para buscar dados
router.get("/", historicoPacientes);

// Rota para exportar dados
router.get("/export", exportPacientes);

export default router;