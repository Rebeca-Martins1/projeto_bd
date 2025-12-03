import express from "express";
import { recursosHumanos } from "../controllers/recursosHumanosController.js";

const router = express.Router();

router.get("/", recursosHumanos);

export default router;