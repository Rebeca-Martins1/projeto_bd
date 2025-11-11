// controllers/plantaoController.js
import pool from "../config/db.js";

export const cadastrarPlantao = async (req, res) => {
  try {
    const { cpf, coren, inicio_plantao, inicio_folga, disponivel } = req.body;

    if (!cpf || !coren || !inicio_plantao || !inicio_folga) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    const query = `
      INSERT INTO plantao (cpf, coren, inicio_plantao, inicio_folga, disponivel)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [cpf, coren, inicio_plantao, inicio_folga, disponivel];

    await pool.query(query, values);

    res.status(201).json({ message: "Plantão cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar plantão:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};
