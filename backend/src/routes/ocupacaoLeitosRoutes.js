import express from "express";
import { ocupacaoLeitos } from "../controllers/ocupacaoLeitosController.js";

const router = express.Router();

router.get("/", ocupacaoLeitos);

export default router;