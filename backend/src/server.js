import express from "express";
import cors from "cors";
import loginRoutes from "./routes/loginRoutes.js";
import cadastroRoutes from "./routes/pacienteRoutes.js"
import cadastromedicoRoutes from "./routes/medicoRoutes.js"
import cadastroleitosRoutes from "./routes/leitosRoutes.js"
import cadastroenfermeiroRoutes from "./routes/enfermeiroRoutes.js"
import plantaoRoutes from "./routes/plantaoRoutes.js"
import cadastroadmcp from "./routes/adm_cpRoutes.js"
import conselhoPresidenteRoutes from "./routes/conselhoPresidenteRoutes.js"
import atividadeCirurgicaRoutes from "./routes/atividadeCirurgicaRoutes.js"
import atividadeMedicaRoutes from "./routes/atividadeMedicaRoutes.js"
import historicoPacientesRoutes from "./routes/historicoPacientesRoutes.js"
import ocupacaoLeitosRoutes from "./routes/ocupacaoLeitosRoutes.js"
import ocupacaoSalasRoutes from "./routes/ocupacaoSalasRoutes.js"
import recursosHumanosRoutes from "./routes/recursosHumanosRoutes.js"

import pool from "./config/db.js"; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/login", loginRoutes);
app.use("/cadastrar", cadastroRoutes);
app.use("/medico", cadastromedicoRoutes);
app.use("/enfermeiro", cadastroenfermeiroRoutes);
app.use("/leitos", cadastroleitosRoutes);
app.use("/admcp", cadastroadmcp);
app.use("/atividadecirurgica", atividadeCirurgicaRoutes);
app.use("/atividademedica", atividadeMedicaRoutes);
app.use("/historicopacientes", historicoPacientesRoutes);
app.use("/ocupacaoleitos", ocupacaoLeitosRoutes);
app.use("/ocupacaosalas", ocupacaoSalasRoutes);
app.use("/recursoshumanos", recursosHumanosRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
