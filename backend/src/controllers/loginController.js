import pool from "../config/db.js";

export const login = async (req, res) => {
  const { cpf, senha, tipo } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM public."PESSOA"
       WHERE cpf = $1 AND senha = $2 AND LOWER(tipo) = LOWER($3)`,
      [cpf, senha, tipo]
    );

    //console.log("🧩 Dados recebidos:", { cpf, senha, tipo });
    //console.log("🧩 Resultado query:", result.rows);

    if (result.rows.length === 0) {
      return res.status(401).send("Cpf, senha ou tipo incorretos.");
    }

    if (result.rows.length === 0) {
      return res.status(401).send("Cpf, senha ou tipo incorretos.");
    }

    const user = result.rows[0];
    res.status(200).json({
      user: {
        cpf: user.cpf,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  } catch (err) {
    console.error("❌ Erro ao fazer login:", err);
    res.status(500).send("Erro ao fazer login.");
  }
};
