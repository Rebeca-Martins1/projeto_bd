import pool from "../config/db.js";

export async function cadastrarMedico(req, res) {
  const {
    cpf,
    nome,
    telefone,
    email,
    sexo,
    senha,
    crm,
    especialidade
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      'SELECT 1 FROM public."MEDICO" WHERE cpf = $1',
      [cpf]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).send("CPF já cadastrado.");
    }

    const tipo = "medico";
    const disponivel = true;

    // Inserção na tabela PESSOA
    await client.query(
      `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo, tipo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [cpf, nome, telefone, email, senha, sexo, tipo]
    );

    // Inserção na tabela MEDICO
    await client.query(
      `INSERT INTO public."MEDICO" (cpf, crm, disponivel)
       VALUES ($1, $2, $3)`,
      [cpf, crm, disponivel]
    );
     
    // Inserção na tabela ESPECIALIDE_MEDICO
    const especialidades = especialidade.split(",").map(e => e.trim());
    for (const esp of especialidades) {
      await client.query(
        'INSERT INTO "ESPECIALIDADE_MEDICO" (cpf_medico, especialidade) VALUES ($1, $2)',
        [cpf, esp]
      );
    }

    await client.query("COMMIT");
    res.status(200).send("✅ Medico cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar medico:", err);
    res.status(500).send("Erro ao cadastrar medico.");
  } finally {
    client.release();
  }
}
