import express from "express";
import { historicoPacientes, exportPacientes } from "../controllers/historicoPacientesController.js";

const router = express.Router();

router.get("/", historicoPacientes);
router.get("/export", exportPacientes);

export default router;