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
    equipeMedica,     
    equipeEnfermagem,
    // NOVOS CAMPOS DO FRONTEND
    tipoLeito,       // 'UTI', 'ENFERMARIA' ou '' (vazio)
    numeroLeito,     // n_sala do leito
    diasInternacao   // Quantidade de dias para calcular a data_saida
  } = req.body;

  try {
    await client.query("BEGIN");

    // ... (Validações de Sala e Horário que fizemos antes continuam aqui) ...
    // ... (Código de verificação de disponibilidade da cirurgia) ...

    // 1. CRIA A CIRURGIA
    const queryCirurgia = `
      INSERT INTO "CIRURGIA" 
      (data_hora, cpf_paciente, n_sala, tipo_sala, duracao_minutos, status, aprovada)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await client.query(queryCirurgia, [
      dataPreferencial,
      cpfPaciente,
      n_sala,
      'CIRURGIA',
      duracao,
      `SOLICITADA: ${grauUrgencia} - ${tipoProcedimento}`,
      false 
    ]);

    // ... (Aloca Médicos e Enfermeiros continua igual) ...

    // 2. NOVA LÓGICA: ALOCAR LEITO (Se o médico escolheu um)
    if (tipoLeito && numeroLeito && diasInternacao) {
      
      // Converte dataPreferencial (timestamp) para Date (YYYY-MM-DD) para entrada
      const dataEntrada = new Date(dataPreferencial);
      
      // Calcula Data de Saída
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
    // ... (Tratamento de erros igual ao anterior) ...
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
      WHERE UPPER(tipo) = 'CIRURGIA' AND ativo = true
      ORDER BY n_sala
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar salas" });
  }
}