import express from "express";
import { salasAtivos, desativarSala, ativarSala} from "../controllers/desativarSalasController.js";

const router = express.Router();

router.get("/salas/ativos", salasAtivos);

router.put("/sala/desativar/:n_sala/:tipo", desativarSala);
router.put("/sala/ativar/:n_sala/:tipo", ativarSala);

export default router;
