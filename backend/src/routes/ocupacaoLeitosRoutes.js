import express from "express";
import { getOcupacaoLeitos } from "../controllers/ocupacaoLeitosController.js";

const router = express.Router();

router.get("/", getOcupacaoLeitos);

export default router;