import express from "express";
import { atividadeMedica } from "../controllers/atividadeMedicaController.js";

const router = express.Router();

router.get("/", atividadeMedica);

export default router;