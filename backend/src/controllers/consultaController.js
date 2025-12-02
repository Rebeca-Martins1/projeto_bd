import db from "../config/db.js";

export const marcarConsulta = async (req, res) => {
  try {
    const { data, hora, tipoConsulta, especialidade, medico, observacoes } =
      req.body;

    const result = await db.query(
      `INSERT INTO consultas 
      (data, hora, tipo_consulta, especialidade, medico, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [data, hora, tipoConsulta, especialidade, medico, observacoes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao marcar consulta:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
