import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json()); // para receber JSON no corpo das requisições

// Conexão com o PostgreSQL
const pool = new Pool({
  user: "postgres",    
  host: "localhost",
  database: "projeto_bd",
  password: "rebecamg",
  port: 5432,
});

// Teste de conexão
pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch(err => console.error("Erro de conexão:", err));

// Rota para cadastrar usuário
app.post("/paciente", async (req, res) => {
  const { cpf, nome, telefone, email } = req.body;

  try {
    await pool.query(
      'INSERT INTO public."PACIENTE" (cpf, nome, telefone, email) VALUES ($1, $2, $3, $4)',
      [cpf, nome, telefone, email]
    );
    res.status(200).send("Paciente cadastrado com sucesso!");
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).send("Erro ao cadastrar paciente.");
  }
});

app.listen(5000, () => console.log("🚀 Servidor rodando na porta 5000"));
