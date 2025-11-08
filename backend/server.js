import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express(); // 👈 define o app primeiro
app.use(cors());
app.use(express.json());

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

// 👇 A PARTIR DAQUI entram as rotas
app.post("/paciente", async (req, res) => {
  console.log("📦 Dados recebidos do frontend:", req.body);

  const { nome, email, sexo, cpf, data_nascimento, telefone, R_telefone, R_cpf, senha } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      'SELECT 1 FROM public."PESSOA" WHERE cpf = $1',
      [cpf]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).send("CPF já cadastrado.");
    }

    await client.query(
      `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cpf, nome, telefone, email, senha, sexo]
    );

    await client.query(
      `INSERT INTO public."PACIENTE" (cpf, data_nascimento, "R_telefone", "R_cpf")
       VALUES ($1, $2, $3, $4)`,
      [cpf, data_nascimento, R_telefone, R_cpf]
    );

    await client.query("COMMIT");
    res.status(200).send("Paciente cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar paciente:", err);
    res.status(500).send("Erro ao cadastrar paciente.");
  } finally {
    client.release();
  }
});

// Inicia o servidor
app.listen(5000, () => console.log("🚀 Servidor rodando na porta 5000"));
