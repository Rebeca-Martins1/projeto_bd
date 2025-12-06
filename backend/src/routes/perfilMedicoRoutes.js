import express from "express";
import { getPerfilMedico, updatePerfilMedico } from "../controllers/perfilMedicoController.js";

const router = express.Router();

router.get("/:cpf", getPerfilMedico);

router.put("/:cpf", updatePerfilMedico);

export default router;