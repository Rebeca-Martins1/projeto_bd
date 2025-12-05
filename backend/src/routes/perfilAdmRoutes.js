import express from "express";
import { infoPerfil, editarPerfil } from "../controllers/editarPerfilAdmController.js";

const router = express.Router();

router.get("/infoperfil/:cpf", infoPerfil);
router.put("/editar/:cpf", editarPerfil);

export default router;
