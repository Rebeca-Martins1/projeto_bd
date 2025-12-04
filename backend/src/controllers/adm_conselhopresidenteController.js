import pool from "../config/db.js";
//SO MUDAR OS NOMES DE ADM PARA CP
export async function cadastrarAdmCP(req, res) {
  const {
    cpf,
    nome,
    telefone,
    email,
    sexo,
    senha,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      'SELECT 1 FROM public."CONSELHO_PRESIDENTE" WHERE cpf = $1',
      [cpf]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).send("CPF já cadastrado.");
    }


    // Inserção na tabela PESSOA
    await client.query(
      `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cpf, nome, telefone, email, senha, sexo]
    );

    // Inserção na tabela CONSELHO_PRESIDENTE
    await client.query(
      `INSERT INTO public."CONSELHO_PRESIDENTE" (cpf)
       VALUES ($1)`,
      [cpf]
    );
     
    

    await client.query("COMMIT");
    res.status(200).send("✅ ADM cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar ADM:", err);
    res.status(500).send("Erro ao cadastrar ADM.");
  } finally {
    client.release();
  }
}
