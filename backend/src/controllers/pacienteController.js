import pool from "../config/db.js";

export async function cadastrarPaciente(req, res) {
  const {
    nome,
    email,
    sexo,
    cpf,
    data_nascimento,
    telefone,
    R_telefone,
    R_cpf,
    empresa_plano,
    numero_carteirinha,
    senha
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      'SELECT 1 FROM public."PACIENTE" WHERE cpf = $1',
      [cpf]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).send("CPF já cadastrado.");
    }

    const tipo = "paciente";

    // Inserção na tabela PESSOA
    await client.query(
      `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo, tipo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [cpf, nome, telefone, email, senha, sexo, tipo]
    );

    // Inserção na tabela PACIENTE
    await client.query(
      `INSERT INTO public."PACIENTE" (cpf, data_nascimento, "R_telefone", "R_cpf", empresa_plano, numero_carteirinha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cpf, data_nascimento, R_telefone, R_cpf, empresa_plano, numero_carteirinha]
    );

    await client.query("COMMIT");
    res.status(200).send("✅ Paciente cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar paciente:", err);
    res.status(500).send("Erro ao cadastrar paciente.");
  } finally {
    client.release();
  }
}
