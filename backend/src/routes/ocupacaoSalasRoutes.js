import express from "express";
import { getOcupacaoSalas } from "../controllers/ocupacaoSalasController.js";

const router = express.Router();

router.get("/", getOcupacaoSalas);

export default router;