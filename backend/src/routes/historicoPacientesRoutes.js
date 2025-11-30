import express from "express";
import { getHistoricoPacientes } from "../controllers/historicoPacientesController.js";

const router = express.Router();

router.get("/", getHistoricoPacientes);

export default router;