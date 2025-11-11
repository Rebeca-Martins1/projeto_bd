import express from "express";
import { cadastrarLeitos } from "../controllers/leitosController.js";

const router = express.Router();

router.post("/", cadastrarLeitos);

export default router;
