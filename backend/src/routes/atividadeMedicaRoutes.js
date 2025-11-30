import express from "express";
import { getAtividadeMedica } from "../controllers/atividadeMedicaController.js";

const router = express.Router();

router.get("/", getAtividadeMedica);

export default router;