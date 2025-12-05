import pool from "../config/db.js";

export const salasAtivos = async (req, res) => {
  try {
    const salas= await pool.query(
        `SELECT n_sala, tipo, ativo FROM "SALAS"`
    )
    res.json(salas.rows);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    res.status(500).send("Erro ao carregar salas.");
  }
};

export const desativarSala = async (req, res) => {
  const { n_sala, tipo } = req.params;

  try {
    const hoje = new Date();
    const consultaCheck = await pool.query(
      `SELECT 1 
       FROM "CONSULTA" 
       WHERE n_sala = $1 AND tipo_sala = $2 
       AND data_hora >= $3 LIMIT 1`,
      [n_sala, tipo, hoje]
    );
    const cirurgiaCheck = await pool.query(
      `SELECT 1 FROM "CIRURGIA" 
       WHERE n_sala = $1 AND tipo_sala = $2 
       AND data_hora >= $3 LIMIT 1`,
      [n_sala, tipo, hoje]
    );

    if (consultaCheck.rowCount > 0 || cirurgiaCheck.rowCount > 0) {
      return res.status(400).send("Sala não pode ser desativada, pois tem consultas ou cirurgias marcadas para uma data futura.");
    }

    await pool.query(
        `UPDATE "SALAS"
        SET ativo = FALSE 
        WHERE n_sala = $1 AND tipo = $2`,
        [n_sala, tipo]
    );

    res.send("Sala desativado com sucesso!");
    } catch (error) {
    console.error("Erro ao desativar sala:", error);
    res.status(500).send("Erro ao desativar sala.");
    }
};

export const ativarSala = async (req, res) => {
  const { n_sala, tipo } = req.params;

  try {
    await pool.query(
        `UPDATE "SALAS"
        SET ativo = TRUE 
        WHERE n_sala = $1 AND tipo = $2`,
        [n_sala, tipo]
    );

    res.send("Sala ativado com sucesso!");
    } catch (error) {
    console.error("Erro ao ativar sala:", error);
    res.status(500).send("Erro ao ativar sala.");
    }
};