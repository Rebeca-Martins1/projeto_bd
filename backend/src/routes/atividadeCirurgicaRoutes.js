import express from "express";
import { atividadeCirurgica, exportCirurgias } from "../controllers/atividadeCirurgicaController.js";

const router = express.Router();

router.get("/", atividadeCirurgica);
router.get("/export", exportCirurgias);

export default router;