import pool from "../config/db.js";

export async function cadastrarEnfermeiro(req, res) {
  const {
    cpf,
    nome,
    telefone,
    email,
    sexo,
    senha,
    coren,
    especialidade
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const disponivel = true;

    const existe_pessoa = await client.query(
      'SELECT 1 FROM public."PESSOA" WHERE cpf = $1',
      [cpf]
    );
    if (existe_pessoa.rows.length > 0) {

      const existe_enfermeiro = await client.query(
        'SELECT 1 FROM public."ENFERMEIRO" WHERE cpf = $1',
        [cpf]
      );

      if (existe_enfermeiro.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).send("CPF já cadastrado.");
      } else {
       await client.query(
          `INSERT INTO public."ENFERMEIRO" (cpf, coren, disponivel)
          VALUES ($1, $2, $3)`,
          [cpf, coren, disponivel]
        );
        
        const especialidades = especialidade.split(",").map(e => e.trim());
        for (const esp of especialidades) {
          await client.query(
            'INSERT INTO "ESPECIALIDADE_ENFERMEIRO" (cpf_enfermeiro, especialidade) VALUES ($1, $2)',
            [cpf, esp]
          );
        }
      }
    } else {
      await client.query(
        `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [cpf, nome, telefone, email, senha, sexo]
      );

      await client.query(
        `INSERT INTO public."ENFERMEIRO" (cpf, coren, disponivel)
        VALUES ($1, $2, $3)`,
        [cpf, coren, disponivel]
      );
      
      const especialidades = especialidade.split(",").map(e => e.trim());
      for (const esp of especialidades) {
        await client.query(
          'INSERT INTO "ESPECIALIDADE_ENFERMEIRO" (cpf_enfermeiro, especialidade) VALUES ($1, $2)',
          [cpf, esp]
        );
      }
    }
    

    await client.query("COMMIT");
    res.status(200).send("✅ Enfermeiro cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar enfermeiro:", err);
    res.status(500).send("Erro ao cadastrar enfermeiro.");
  } finally {
    client.release();
  }
}
