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

    const disponivel = true;

    const existe_pessoa = await client.query(
      'SELECT 1 FROM public."PESSOA" WHERE cpf = $1',
      [cpf]
    );
    if (existe_pessoa.rows.length > 0) {

      const existe_medico = await client.query(
        'SELECT 1 FROM public."MEDICO" WHERE cpf = $1',
        [cpf]
      );

      if (existe_medico.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).send("CPF já cadastrado.");
      } else {
       await client.query(
        `INSERT INTO public."MEDICO" (cpf, crm, disponivel)
        VALUES ($1, $2, $3)`,
        [cpf, crm, disponivel]
      );
       const especialidades = especialidade.split(",").map(e => e.trim());
        for (const esp of especialidades) {
          await client.query(
            'INSERT INTO "ESPECIALIDADE_MEDICO" (cpf_medico, especialidade) VALUES ($1, $2)',
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
        `INSERT INTO public."MEDICO" (cpf, crm, disponivel)
        VALUES ($1, $2, $3)`,
        [cpf, crm, disponivel]
      );

      const especialidades = especialidade.split(",").map(e => e.trim());
        for (const esp of especialidades) {
          await client.query(
            'INSERT INTO "ESPECIALIDADE_MEDICO" (cpf_medico, especialidade) VALUES ($1, $2)',
            [cpf, esp]
          );
        }
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
