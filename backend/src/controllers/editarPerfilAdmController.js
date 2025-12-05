import pool from "../config/db.js";

export const infoPerfil = async (req, res) => {
  const { cpf } = req.params;

  try {
    const info = await pool.query(
      `SELECT cpf, nome, telefone, email, sexo, senha 
       FROM "PESSOA"
       WHERE cpf = $1`,
      [cpf]
    );

    if (info.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(info.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar info:", error);
    res.status(500).send("Erro ao carregar info.");
  }
};

export const editarPerfil = async (req, res) => {
  const { cpf } = req.params;
  const { nome, telefone, email, senha } = req.body;

  try {
    await pool.query(
      `UPDATE "PESSOA"
       SET nome = $1, telefone = $2, email = $3, senha = $4
       WHERE cpf = $5`,
      [nome, telefone, email, senha, cpf]
    );

    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).send("Erro ao atualizar perfil.");
  }
};
