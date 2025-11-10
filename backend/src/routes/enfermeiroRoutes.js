import express from "express";
import { cadastrarEnfermeiro } from "../controllers/enfermeiroController.js";

const router = express.Router();

router.post("/", cadastrarEnfermeiro);

export default router;
