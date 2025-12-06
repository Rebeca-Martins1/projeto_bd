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
        'SELECT ativo FROM public."MEDICO" WHERE cpf = $1',
        [cpf]
      );

      if (existe_medico.rows.length > 0) {
        if (existe_medico.rows[0].ativo === true) {
          await client.query("ROLLBACK");
          return res.status(400).send("CPF já cadastrado.");
        }else {
          await client.query(
            `UPDATE public."MEDICO" 
            SET ativo = true 
            WHERE cpf = $1`,
            [cpf]
          );
        }
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

export async function listarConsultasDoMedico(req, res) {
  const { cpf } = req.params;

  try {
    const query = `
      SELECT 
        c.data_hora,
        c.tipo_consulta,
        c.observacoes,
        c.n_sala,
        c.tipo_sala,
        p.nome AS paciente
      FROM "CONSULTA" c
      JOIN "PESSOA" p ON p.cpf = c.cpf_paciente
      WHERE c.cpf_medico = $1
      ORDER BY c.data_hora;
    `;

    const result = await pool.query(query, [cpf]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao listar consultas do médico:", err);
    return res.status(500).json({ erro: "Erro ao buscar consultas." });
  }
}

export async function listarCirurgiasDoMedico(req, res) {
  const { cpf } = req.params;

  try {
    const client = await pool.connect();
    const query = `
      SELECT 
        c.data_hora,
        c.n_sala,
        c.tipo_sala,
        c.duracao_minutos,
        c.status,     -- Ex: 'SOLICITADA', 'REALIZADA'
        c.aprovada,   -- true ou false
        p.nome AS paciente_nome
      FROM "CIRURGIA" c
      JOIN "ALOCA_MEDICO_CIRURGIA" amc 
        ON c.data_hora = amc.data_hora 
        AND c.cpf_paciente = amc.cpf_paciente
      JOIN "PESSOA" p 
        ON p.cpf = c.cpf_paciente
      WHERE amc.cpf_medico = $1
      ORDER BY c.data_hora DESC
    `;

    const result = await client.query(query, [cpf]);
    client.release();

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao listar cirurgias:", err);
    return res.status(500).json({ error: "Erro ao buscar cirurgias." });
  }
}
