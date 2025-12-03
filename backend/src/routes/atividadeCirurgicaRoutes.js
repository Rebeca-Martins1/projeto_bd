import express from "express";
import { atividadeCirurgica } from "../controllers/atividadeCirurgicaController.js";

const router = express.Router();

router.get("/", atividadeCirurgica);

export default router;