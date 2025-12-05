import express from "express";
import { cirurgiasPendentes, aprovarCirurgias, desaprovarCirurgias} from "../controllers/solicitacao_cirurgiaController.js";

const router = express.Router();

router.get("/cirurgias", cirurgiasPendentes);

router.put("/cirurgias/aprovar/:cpf_paciente/:data_hora", aprovarCirurgias);
router.put("/cirurgias/desaprovar/:cpf_paciente/:data_hora", desaprovarCirurgias);

export default router;
