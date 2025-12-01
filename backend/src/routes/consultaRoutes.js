import express from "express";
import { marcarConsulta } from "../controllers/consultaController.js";

const router = express.Router();

router.post("/", marcarConsulta);

export default router;
