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
        'SELECT ativo FROM public."ENFERMEIRO" WHERE cpf = $1',
        [cpf]
      );

      if (existe_enfermeiro.rows.length > 0) {
        if(existe_enfermeiro.rows[0].ativo === true){
          await client.query("ROLLBACK");
          return res.status(400).send("CPF já cadastrado.");
        } else {
          await client.query(
            `UPDATE public."ENFERMEIRO" 
            SET ativo = true 
            WHERE cpf = $1`,
            [cpf]
          );
        }
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

export async function getPerfil(req, res) {
  const { cpf } = req.params;

  try {
    const query = `
      SELECT 
        p.nome, p.email, p.telefone, p.sexo, p.senha,
        e.coren, e.inicio_plantao, e.inicio_folga, 
        e.leito_responsavel, e.tipo_leito_responsavel, e.disponivel, e.ativo
      FROM "ENFERMEIRO" e
      JOIN "PESSOA" p ON e.cpf = p.cpf
      WHERE e.cpf = $1
    `;
    
    const result = await pool.query(query, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Enfermeiro não encontrado" });
    }

    const espQuery = `SELECT especialidade FROM "ESPECIALIDADE_ENFERMEIRO" WHERE cpf_enfermeiro = $1`;
    const espResult = await pool.query(espQuery, [cpf]);
    
    const dados = {
        ...result.rows[0],
        especialidades: espResult.rows.map(r => r.especialidade) 
    };

    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ erro: "Erro interno." });
  }
}

export async function updatePerfil(req, res) {
  const { cpf } = req.params;
  const { nome, telefone, email, senha, coren } = req.body; 

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (nome || telefone || email || senha) {
        await client.query(
            `UPDATE "PESSOA" SET 
                nome = COALESCE($1, nome),
                telefone = COALESCE($2, telefone),
                email = COALESCE($3, email),
                senha = COALESCE($4, senha)
             WHERE cpf = $5`,
            [nome, telefone, email, senha, cpf]
        );
    }

    if (coren) {
        await client.query(
            `UPDATE "ENFERMEIRO" SET coren = $1 WHERE cpf = $2`,
            [coren, cpf]
        );
    }

    await client.query("COMMIT");
    res.status(200).json({ mensagem: "Perfil atualizado com sucesso!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao atualizar:", error);
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------
// ESSA É A FUNÇÃO CORRIGIDA QUE EVITA DUPLICATAS
// ---------------------------------------------------------
export async function getMinhasCirurgias(req, res) {
    const { cpf } = req.params;
    try {
        const query = `
            SELECT 
                c.data_hora,
                c.n_sala,
                c.tipo_sala,
                c.duracao_minutos,
                c.status,
                p.nome AS paciente_nome,
                -- STRING_AGG junta múltiplos médicos em uma string só (Ex: "Dr. A, Dr. B")
                -- COALESCE garante que se não tiver médico, aparece "A definir"
                COALESCE(STRING_AGG(DISTINCT m.nome, ', '), 'A definir') AS medico_responsavel_nome
            FROM "ALOCA_ENFERMEIRO_CIRURGIA" aec
            JOIN "CIRURGIA" c ON aec.data_hora = c.data_hora AND aec.cpf_paciente = c.cpf_paciente
            JOIN "PACIENTE" pac ON c.cpf_paciente = pac.cpf
            JOIN "PESSOA" p ON pac.cpf = p.cpf
            -- LEFT JOIN para trazer médicos se houver
            LEFT JOIN "ALOCA_MEDICO_CIRURGIA" amc ON c.data_hora = amc.data_hora AND c.cpf_paciente = amc.cpf_paciente
            LEFT JOIN "PESSOA" m ON amc.cpf_medico = m.cpf
            WHERE aec.cpf_enfermeiro = $1
            -- Agrupamos pelos dados da cirurgia e paciente para evitar linhas repetidas
            GROUP BY c.data_hora, c.cpf_paciente, c.n_sala, c.tipo_sala, c.duracao_minutos, c.status, p.nome
            ORDER BY c.data_hora ASC
        `;
        const result = await pool.query(query, [cpf]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar cirurgias:", error);
        res.status(500).json({ erro: "Erro ao buscar cirurgias." });
    }
}

export async function getLeitos(req, res) {
    try {
        const result = await pool.query(`SELECT * FROM "LEITOS" ORDER BY n_sala ASC`);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar leitos." });
    }
}

export async function assumirLeito(req, res) {
    const { cpf } = req.params;
    const { n_sala, tipo } = req.body; 

    try {
        await pool.query(
            `UPDATE "ENFERMEIRO" 
             SET leito_responsavel = $1, tipo_leito_responsavel = $2 
             WHERE cpf = $3`,
            [n_sala, tipo, cpf]
        );
        res.status(200).json({ mensagem: "Leito atribuído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao assumir leito." });
    }
}


export async function registrarPlantao(req, res) {
    const { cpf } = req.params;
    const { inicio_plantao, inicio_folga, disponivel } = req.body;

    try {
        await pool.query(
            `UPDATE "ENFERMEIRO" 
             SET inicio_plantao = COALESCE($1, inicio_plantao),
                 inicio_folga = COALESCE($2, inicio_folga),
                 disponivel = COALESCE($3, disponivel)
             WHERE cpf = $4`,
            [inicio_plantao, inicio_folga, disponivel, cpf]
        );
        res.status(200).json({ mensagem: "Horários de plantão atualizados." });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar plantão." });
    }
}

export async function getProcedimentosDia(req, res) {
  try {
    const query = `
      SELECT 
        c.data_hora || c.cpf_paciente as id,
        to_char(c.data_hora, 'HH24:MI') as hora, 
        pes.nome as paciente,
        CAST(c.n_sala AS VARCHAR) as leito, 
        'Cirurgia (' || c.tipo_sala || ')' as tipo,
        COALESCE(c.status, 'Agendada') as status
      FROM "CIRURGIA" c
      JOIN "PACIENTE" pac ON c.cpf_paciente = pac.cpf
      JOIN "PESSOA" pes ON pac.cpf = pes.cpf
      WHERE c.data_hora::date = CURRENT_DATE 
      ORDER BY c.data_hora ASC
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erro ao buscar procedimentos:", error);
    res.status(500).json({ erro: "Erro ao buscar cirurgias do dia." });
  }
}

export async function getMeuLeitoResponsavel(req, res) {
    const { cpf } = req.params;

    try {
        const query = `
            SELECT 
                l.n_sala,
                l.tipo AS tipo_leito_responsavel, -- Alias para bater com seu frontend
                l.capacidade,
                l.quant_paciente,
                l.ativo AS disponivel             -- Alias para bater com seu frontend
            FROM "ENFERMEIRO" e
            JOIN "LEITOS" l 
                ON e.leito_responsavel = l.n_sala 
                AND e.tipo_leito_responsavel = l.tipo
            WHERE e.cpf = $1
        `;

        const result = await pool.query(query, [cpf]);

        if (result.rows.length > 0) {
            // Retorna o objeto do leito encontrado
            res.status(200).json(result.rows[0]);
        } else {
            // Se não achar (retorna null para o frontend tratar com "Você não possui leito")
            res.status(200).json(null);
        }

    } catch (error) {
        console.error("Erro ao buscar leito do enfermeiro:", error);
        res.status(500).json({ erro: "Erro ao buscar informações do leito." });
    }
}