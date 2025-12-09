import pool from "../config/db.js";

export async function listarMedicos(req, res) {
  try {
    const result = await pool.query(`
      SELECT p.cpf, p.nome 
      FROM "PESSOA" p
      JOIN "MEDICO" m ON p.cpf = m.cpf
      WHERE m.ativo = true
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar médicos" });
  }
}

export async function listarEnfermeiros(req, res) {
  try {
    const result = await pool.query(`
      SELECT p.cpf, p.nome 
      FROM "PESSOA" p
      JOIN "ENFERMEIRO" e ON p.cpf = e.cpf
      WHERE e.ativo = true
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar enfermeiros" });
  }
}

export async function listarLeitos(req, res) {
  const { tipo } = req.query; 
  try {
    if (!tipo) return res.json([]);

    const result = await pool.query(`
      SELECT n_sala, tipo, capacidade 
      FROM "LEITOS" 
      WHERE tipo = $1 AND ativo = true
      ORDER BY n_sala
    `, [tipo]);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar leitos" });
  }
}

export async function criarSolicitacaoCirurgia(req, res) {
  const client = await pool.connect();
  
  const {
    cpfPaciente,
    tipoProcedimento,
    grauUrgencia,
    duracao,
    necessidades,
    dataPreferencial,
    n_sala,
    cpfMedicoResponsavel, 
    equipeMedica,         
    equipeEnfermagem,     
    tipoLeito,       
    numeroLeito,     
    diasInternacao,
    tipo_sala             
  } = req.body;

  try {
    await client.query("BEGIN");

    const queryCirurgia = `
      INSERT INTO "CIRURGIA" 
      (data_hora, cpf_paciente, n_sala, tipo_sala, duracao_minutos, status, aprovada)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await client.query(queryCirurgia, [
      dataPreferencial,
      cpfPaciente,
      n_sala,
      tipo_sala || 'Cirurgia',
      duracao,
      `SOLICITADA: ${grauUrgencia} - ${tipoProcedimento}`, 
      false
    ]);
    // ============================================================
    // 2. ALOCAR MÉDICOS (RESPONSÁVEL + EQUIPE)
    // ============================================================
    
    // A. Aloca o Médico Responsável (quem está logado)
    if (cpfMedicoResponsavel) {
      await client.query(
        `INSERT INTO "ALOCA_MEDICO_CIRURGIA" (data_hora, cpf_paciente, cpf_medico)
         VALUES ($1, $2, $3)`,
        [dataPreferencial, cpfPaciente, cpfMedicoResponsavel]
      );
    }

    // B. Aloca a Equipe Médica (Auxiliares)
    if (equipeMedica && equipeMedica.length > 0) {
      for (const cpfMedico of equipeMedica) {
        // Evita duplicar se o médico selecionou a si mesmo na lista
        if (cpfMedico !== cpfMedicoResponsavel) {
          await client.query(
            `INSERT INTO "ALOCA_MEDICO_CIRURGIA" (data_hora, cpf_paciente, cpf_medico)
             VALUES ($1, $2, $3)`,
            [dataPreferencial, cpfPaciente, cpfMedico]
          );
        }
      }
    }

    // ============================================================
    // 3. ALOCAR ENFERMEIROS
    // ============================================================
    if (equipeEnfermagem && equipeEnfermagem.length > 0) {
      for (const cpfEnfermeiro of equipeEnfermagem) {
        await client.query(
          `INSERT INTO "ALOCA_ENFERMEIRO_CIRURGIA" (data_hora, cpf_paciente, cpf_enfermeiro)
           VALUES ($1, $2, $3)`,
          [dataPreferencial, cpfPaciente, cpfEnfermeiro]
        );
      }
    }

    // ============================================================
    // 4. ALOCAR LEITO (Lógica que você já tinha)
    // ============================================================
    if (tipoLeito && numeroLeito && diasInternacao) {
      const dataEntrada = new Date(dataPreferencial);
      const dataSaida = new Date(dataEntrada);
      dataSaida.setDate(dataSaida.getDate() + parseInt(diasInternacao));

      if (tipoLeito === 'UTI') {
        await client.query(
          `INSERT INTO "ALOCA_LEITO_UTI_PACIENTE" 
           (data_entrada, data_saida, cpf_paciente, n_sala, tipo_leito) 
           VALUES ($1, $2, $3, $4, $5)`,
          [dataEntrada, dataSaida, cpfPaciente, numeroLeito, 'UTI']
        );
      } else if (tipoLeito === 'ENFERMARIA') {
        await client.query(
          `INSERT INTO "ALOCA_LEITO_ENFERMARIA_PACIENTE" 
           (data_entrada, data_saida, cpf_paciente, n_sala, tipo_leito) 
           VALUES ($1, $2, $3, $4, $5)`,
          [dataEntrada, dataSaida, cpfPaciente, numeroLeito, 'ENFERMARIA']
        );
      }
    }
    
    await client.query("COMMIT");
    res.status(201).json({ message: "Solicitação enviada com sucesso!" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro na transação:", error);
    
    // Tratamento de erro específico (duplicidade)
    if (error.code === '23505') {
       return res.status(400).json({ error: "Horário ou sala já ocupados." });
    }

    res.status(500).json({ error: "Erro ao processar solicitação: " + error.message });
  } finally {
    client.release();
  }
}
export async function listarSalas(req, res) {
  try {
    const result = await pool.query(`
      SELECT n_sala, tipo 
      FROM "SALAS" 
      WHERE tipo = 'Cirurgia' AND ativo = true
      ORDER BY n_sala
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar salas" });
  }
}