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
  password: "leafar1806",
  port: 5432,
});

// Teste de conexão
pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch(err => console.error("Erro de conexão:", err));

//cadastro
  app.post("/paciente", async (req, res) => {
  console.log("📦 Dados recebidos do frontend:", req.body);

  const { nome, email, sexo, cpf, data_nascimento, telefone, R_telefone, R_cpf, empresa_plano, numero_carteirinha, senha} = req.body;
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
    const tipo = "paciente";
    await client.query(
      `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo, tipo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [cpf, nome, telefone, email, senha, sexo, tipo]
    );

    await client.query(
      `INSERT INTO public."PACIENTE" (cpf, data_nascimento, "R_telefone", "R_cpf", empresa_plano, numero_carteirinha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cpf, data_nascimento, R_telefone, R_cpf, empresa_plano, numero_carteirinha]
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

//login
app.post("/login", async (req, res) => {
  const { cpf, senha, tipo } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM public."PESSOA" 
       WHERE cpf = $1 AND senha = $2 AND tipo = $3`,
      [cpf, senha, tipo]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Cpf, senha ou tipo incorretos.");
    }

    const user = result.rows[0];
    res.status(200).json({
      user: {
        cpf: user.cpf,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  } catch (err) {
    console.error("❌ Erro ao fazer login:", err);
    res.status(500).send("Erro ao fazer login.");
  }
});


// Inicia o servidor
app.listen(5000, () => console.log("🚀 Servidor rodando na porta 5000"));
