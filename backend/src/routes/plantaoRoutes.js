import express from "express";
import { cadastrarPlantao } from "../controllers/plantaoController.js";

const router = express.Router();

// POST /plantao/cadastrar
router.post("/cadastrar", cadastrarPlantao);

export default router;
