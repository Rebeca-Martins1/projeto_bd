import express from "express";
import { leitosAtivos, desativarLeito, ativarLeito} from "../controllers/desativarLeitosController.js";

const router = express.Router();

router.get("/leitos/ativos", leitosAtivos);

router.put("/leito/desativar/:n_sala/:tipo", desativarLeito);
router.put("/leito/ativar/:n_sala/:tipo", ativarLeito);

export default router;
