import express from "express";
import { cadastrarMedico } from "../controllers/medicoController.js";

const router = express.Router();

router.post("/", cadastrarMedico);

export default router;
