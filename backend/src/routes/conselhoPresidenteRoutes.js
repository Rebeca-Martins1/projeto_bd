import express from "express";
import { conselhoPresidente } from "../controllers/conselhoPresidenteController.js";

const router = express.Router();

router.get("/", conselhoPresidente);

export default router;