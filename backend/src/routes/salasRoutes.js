import express from "express";
import { cadastrarSalas } from "../controllers/salasController.js";

const router = express.Router();

router.post("/", cadastrarSalas);

export default router;
