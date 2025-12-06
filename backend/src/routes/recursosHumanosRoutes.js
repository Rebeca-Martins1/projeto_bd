import express from "express";
import { recursosHumanos, exportRecursosHumanos } from "../controllers/recursosHumanosController.js";

const router = express.Router();

router.get("/", recursosHumanos);
router.get("/export", exportRecursosHumanos); 

export default router;