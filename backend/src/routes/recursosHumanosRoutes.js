import express from "express";
import { getRecursosHumanos } from "../controllers/recursosHumanosController.js";

const router = express.Router();

router.get("/", getRecursosHumanos);

export default router;