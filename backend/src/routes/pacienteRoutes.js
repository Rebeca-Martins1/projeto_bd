import express from "express";
import { cadastrarPaciente } from "../controllers/pacienteController.js";

const router = express.Router();

router.post("/", cadastrarPaciente);

export default router;
