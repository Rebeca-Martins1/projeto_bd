import express from "express";
import { leitosAtivos, enfermeirosAtivos, alocaEnfermeiro } from "../controllers/alocaLeitoEnfermeiroController.js";

const router = express.Router();

router.get("/listarLeitos", leitosAtivos);
router.get("/listarEnfermeiros", enfermeirosAtivos);

router.put("/alocar/enfermeiro/:cpf/:tipo/:n_leito", alocaEnfermeiro);

export default router;