import express from "express";
import { getAtividadeCirurgica } from "../controllers/atividadeCirurgicaController.js";

const router = express.Router();

router.get("/", getAtividadeCirurgica);

export default router;