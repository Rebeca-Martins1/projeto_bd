import express from "express";
import cors from "cors";
import loginRoutes from "./routes/loginRoutes.js";
import cadastroRoutes from "./routes/pacienteRoutes.js"
import pool from "./config/db.js"; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/login", loginRoutes);
app.use("/cadastrar", cadastroRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
