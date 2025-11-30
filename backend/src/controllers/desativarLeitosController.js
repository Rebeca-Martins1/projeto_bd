import pool from "../config/db.js";

export const leitosAtivos = async (req, res) => {
  try {
    const leitos= await pool.query(
        `SELECT n_sala, tipo, quant_paciente, ativo FROM "LEITOS"`
    )
    res.json(leitos.rows);
  } catch (error) {
    console.error("Erro ao buscar leitos:", error);
    res.status(500).send("Erro ao carregar leitos.");
  }
};

export const desativarLeito = async (req, res) => {
  const { n_sala, tipo } = req.params;

  try {
    const ocupadoCheck = await pool.query(
        `SELECT quant_paciente 
        FROM "LEITOS"
        WHERE n_sala = $1 AND tipo = $2`,
        [n_sala, tipo]
    );

    if (ocupadoCheck.rowCount === 0) {
        return res.status(404).send("Leito não encontrado.");
    }

    if (ocupadoCheck.rows[0].quant_paciente > 0) {
        return res.status(400).send("Leito ocupado não pode ser desativado.");
    }

    await pool.query(
        `UPDATE "LEITOS"
        SET ativo = FALSE 
        WHERE n_sala = $1 AND tipo = $2`,
        [n_sala, tipo]
    );

    res.send("Leito desativado com sucesso!");
    } catch (error) {
    console.error("Erro ao desativar leito:", error);
    res.status(500).send("Erro ao desativar leito.");
    }
};

export const ativarLeito = async (req, res) => {
  const { n_sala, tipo } = req.params;

  try {
    await pool.query(
        `UPDATE "LEITOS"
        SET ativo = TRUE 
        WHERE n_sala = $1 AND tipo = $2`,
        [n_sala, tipo]
    );

    res.send("Leito ativado com sucesso!");
    } catch (error) {
    console.error("Erro ao ativar leito:", error);
    res.status(500).send("Erro ao ativar leito.");
    }
};