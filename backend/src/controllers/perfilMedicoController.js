import pool from "../config/db.js";

export async function getPerfilMedico(req, res) {
  const { cpf } = req.params;

  try {
    const query = `
      SELECT p.cpf, p.nome, p.telefone, p.email, p.senha, m.crm
      FROM "PESSOA" p
      JOIN "MEDICO" m ON p.cpf = m.cpf
      WHERE p.cpf = $1
    `;
    
    const result = await pool.query(query, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Médico não encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil do médico:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function updatePerfilMedico(req, res) {
  const { cpf } = req.params;
  const { nome, telefone, email, senha } = req.body;

  try {
    const query = `
      UPDATE "PESSOA"
      SET nome = $1, telefone = $2, email = $3, senha = $4
      WHERE cpf = $5
    `;

    await pool.query(query, [nome, telefone, email, senha, cpf]);

    return res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil do médico:", error);
    return res.status(500).json({ error: "Erro ao atualizar dados." });
  }
}