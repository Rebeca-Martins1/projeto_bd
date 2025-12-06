import express from "express";
import { cadastrarMedico, listarConsultasDoMedico, listarCirurgiasDoMedico } from "../controllers/medicoController.js";

const router = express.Router();

router.post("/", cadastrarMedico);

router.get("/:cpf/consultas", listarConsultasDoMedico);

router.get("/:cpf/cirurgias", listarCirurgiasDoMedico);

export default router;
