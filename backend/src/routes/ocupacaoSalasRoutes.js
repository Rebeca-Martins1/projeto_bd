import express from "express";
import { ocupacaoSalas } from "../controllers/ocupacaoSalasController.js";

const router = express.Router();

router.get("/", ocupacaoSalas);

export default router;