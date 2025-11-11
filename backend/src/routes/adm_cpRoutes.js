import express from "express";
import { cadastrarAdmCP } from "../controllers/adm_conselhopresidenteController.js";

const router = express.Router();

router.post("/", cadastrarAdmCP);

export default router;
