import express from "express";
import { ocupacaoLeitos, exportLeitos } from "../controllers/ocupacaoLeitosController.js";

const router = express.Router();

router.get("/", ocupacaoLeitos);
router.get("/export", exportLeitos);

export default router;