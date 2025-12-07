import pool from "../config/db.js";

// 1. Listar Especialidades
export async function listarEspecialidades(req, res) {
  try {
    const query = `
      SELECT DISTINCT em.especialidade
      FROM "ESPECIALIDADE_MEDICO" em
      JOIN "MEDICO" m ON em.cpf_medico = m.cpf
      WHERE m.ativo = true AND m.disponivel = true;
    `;
    const result = await pool.query(query);
    const lista = result.rows.map(r => r.especialidade);
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar especialidades" });
  }
}

// 2. Listar Médicos por Especialidade
export async function listarMedicosPorEspecialidade(req, res) {
  const { especialidade } = req.params;
  try {
    const query = `
      SELECT m.cpf, p.nome 
      FROM "MEDICO" m
      JOIN "PESSOA" p ON m.cpf = p.cpf
      JOIN "ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
      WHERE em.especialidade = $1 AND m.ativo = true;
    `;
    const result = await pool.query(query, [especialidade]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar médicos" });
  }
}

// 3. Marcar Consulta (A função que estava faltando!)
export async function agendarConsulta(req, res) {
  const { data, hora, tipoConsulta, cpf_medico, cpf_paciente, observacoes } = req.body;

  const dataHoraCombinada = `${data} ${hora}:00`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // A. Verifica se o MÉDICO já tem consulta
    const checkMedico = await client.query(
      `SELECT 1 FROM "CONSULTA" WHERE cpf_medico = $1 AND data_hora = $2`,
      [cpf_medico, dataHoraCombinada]
    );
    if (checkMedico.rows.length > 0) {
      throw new Error("O médico selecionado já possui um agendamento neste horário.");
    }

    // 🆕 B. Verifica se o PACIENTE já tem consulta (NOVA LÓGICA)
    const checkPaciente = await client.query(
      `SELECT 1 FROM "CONSULTA" WHERE cpf_paciente = $1 AND data_hora = $2`,
      [cpf_paciente, dataHoraCombinada]
    );
    if (checkPaciente.rows.length > 0) {
      throw new Error("Você já possui uma consulta marcada neste horário.");
    }

    // C. Busca uma sala disponível (Lógica existente)
    const salaQuery = await client.query(
      `SELECT n_sala, tipo FROM "SALAS" WHERE tipo = 'CONSULTORIO' AND ativo = true LIMIT 1`
    );

    if (salaQuery.rows.length === 0) {
      throw new Error("Nenhuma sala de consultório disponível no sistema.");
    }

    const { n_sala, tipo: tipo_sala } = salaQuery.rows[0];

    // D. Insere a consulta
    await client.query(
      `INSERT INTO "CONSULTA" 
      (data_hora, cpf_paciente, cpf_medico, n_sala, tipo_sala, tipo_consulta, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [dataHoraCombinada, cpf_paciente, cpf_medico, n_sala, tipo_sala, tipoConsulta, observacoes]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Consulta agendada com sucesso!" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao agendar:", error);
    // O Frontend vai exibir a mensagem que colocamos no "throw new Error" acima
    res.status(400).json({ error: error.message || "Erro ao processar agendamento" });
  } finally {
    client.release();
  }
}