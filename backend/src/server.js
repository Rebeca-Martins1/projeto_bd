import express from "express";
import cors from "cors";
import loginRoutes from "./routes/loginRoutes.js";
import cadastroRoutes from "./routes/pacienteRoutes.js"
import cadastromedicoRoutes from "./routes/medicoRoutes.js"
import cadastroleitosRoutes from "./routes/leitosRoutes.js"
import cadastroenfermeiroRoutes from "./routes/enfermeiroRoutes.js"
import plantaoRoutes from "./routes/plantaoRoutes.js"
import cadastroadmcp from "./routes/adm_cpRoutes.js"
import pool from "./config/db.js"; 
import consultaRoutes from "./routes/consultaRoutes.js";

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
app.use("/plantao", plantaoRoutes);
app.use("/consultas", consultaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
