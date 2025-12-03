import pool from "../config/db.js";

export const listarMedicos = async (req, res) => {
  try {
    const medicos= await pool.query(
        `SELECT "MEDICO".cpf, "MEDICO".crm, "MEDICO".ativo, "PESSOA".nome 
        FROM "MEDICO" JOIN "PESSOA" ON "MEDICO".cpf = "PESSOA".cpf`
    )
    res.json(medicos.rows);
  } catch (error) {
    console.error("Erro ao buscar medicos:", error);
    res.status(500).send("Erro ao carregar medicos.");
  }
};

export const listarEnfermeiros = async (req, res) => {
  try {
    const enfermeiros= await pool.query(
        `SELECT "ENFERMEIRO".cpf, "ENFERMEIRO".coren, "ENFERMEIRO".ativo, "PESSOA".nome 
        FROM "ENFERMEIRO" JOIN "PESSOA" ON "ENFERMEIRO".cpf= "PESSOA".cpf`
    )
    res.json(enfermeiros.rows);
  } catch (error) {
    console.error("Erro ao buscar enfermeiros:", error);
    res.status(500).send("Erro ao carregar enfermeiros.");
  }
};

export const desativarMedico = async (req, res) => {
  const { cpf} = req.params;

  try {
    const hoje = new Date();

    const tem_consultaCheck = await pool.query(
        `SELECT 1
        FROM "CONSULTA"
        WHERE cpf_medico = $1 AND data_hora >= $2 LIMIT 1`,
        [cpf, hoje]
    );
    const tem_cirurgiaCheck = await pool.query(
        `SELECT 1
        FROM "ALOCA_MEDICO_CIRURGIA"
        WHERE cpf_medico = $1 AND data_hora >= $2 LIMIT 1`,
        [cpf, hoje]
    );


    if (tem_consultaCheck.rowCount > 0 || tem_cirurgiaCheck.rowCount > 0) {
        return res.status(404).send("Medico não pode ser destivado, pois tem cirurgia ou consulta marcadas com ele em uma data futura.");
    }

    await pool.query(
        `UPDATE "MEDICO"
        SET ativo = FALSE 
        WHERE cpf = $1`,
        [cpf]
    );

    res.send("Medico desativado com sucesso!");
    } catch (error) {
    console.error("Erro ao desativar medico:", error);
    res.status(500).send("Erro ao desativar medico.");
    }
};

export const desativarEnfermeiro = async (req, res) => {
  const { cpf} = req.params;

  try {
    const hoje = new Date();

    const tem_cirurgiaCheck = await pool.query(
        `SELECT 1
        FROM "ALOCA_ENFERMEIRO_CIRURGIA"
        WHERE cpf_enfermeiro = $1 AND data_hora >= $2 LIMIT 1`,
        [cpf, hoje]
    );


    if (tem_cirurgiaCheck.rowCount > 0) {
        return res.status(404).send("Enfermeiro não pode ser destivado, pois tem cirurgia marcada com ele em uma data futura.");
    }

    await pool.query(
        `UPDATE "ENFERMEIRO"
        SET ativo = FALSE 
        WHERE cpf = $1`,
        [cpf]
    );

    res.send("Enfermeiro desativado com sucesso!");
    } catch (error) {
    console.error("Erro ao desativar enfermeiro:", error);
    res.status(500).send("Erro ao desativar enfermeiro.");
    }
};


export const ativarMedico = async (req, res) => {
  const { cpf } = req.params;

  try {
    await pool.query(
        `UPDATE "MEDICO"
        SET ativo = TRUE 
        WHERE cpf = $1`,
        [cpf]
    );

    res.send("Medico ativado com sucesso!");
    } catch (error) {
    console.error("Erro ao ativar medico:", error);
    res.status(500).send("Erro ao ativar medico.");
    }
};

export const ativarEnfermeiro = async (req, res) => {
  const { cpf } = req.params;

  try {
    await pool.query(
        `UPDATE "ENFERMEIRO"
        SET ativo = TRUE 
        WHERE cpf = $1`,
        [cpf]
    );

    res.send("Enfermeiro ativado com sucesso!");
    } catch (error) {
    console.error("Erro ao ativar enfermeiro:", error);
    res.status(500).send("Erro ao ativar enfermeiro.");
    }
};