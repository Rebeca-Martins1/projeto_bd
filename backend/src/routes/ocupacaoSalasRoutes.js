import express from "express";
import { ocupacaoSalas, exportSalas } from "../controllers/ocupacaoSalasController.js";

const router = express.Router();

router.get("/", ocupacaoSalas);
router.get("/export", exportSalas); 

export default router;