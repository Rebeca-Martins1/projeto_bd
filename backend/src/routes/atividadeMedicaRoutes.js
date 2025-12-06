import express from "express";
import { atividadeMedica, exportAtividadeMedica } from "../controllers/atividadeMedicaController.js";

const router = express.Router();

router.get("/", atividadeMedica);
router.get("/export", exportAtividadeMedica);

export default router;