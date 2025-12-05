import pool from "../config/db.js";

export async function cirurgiasPendentes(req, res) {
  try {
    const cirurgias_pendentes = await pool.query(
      `SELECT *
       FROM "CIRURGIA" 
       WHERE aprovada = FALSE`
    );
    res.json(cirurgias_pendentes.rows);
  } catch (error) {
    console.error("Erro ao buscar cirurgias pendentes:", error);
    res.status(500).send("Erro ao carregar cirurgias pendentes.");
  }
}

export async function aprovarCirurgias(req, res) {
  const { cpf_paciente, data_hora } = req.params;

  try {
    const date = new Date(data_hora);
    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":00";
    await pool.query(
      `UPDATE "CIRURGIA"
       SET aprovada = TRUE
       WHERE cpf_paciente = $1 AND data_hora = $2::timestamp`,
      [cpf_paciente, formatted]
    );

    res.send("Cirurgia aprovada com sucesso!");
  } catch (error) {
    console.error("Erro ao aprovar cirurgia:", error);
    res.status(500).send("Erro ao aprovar cirurgia.");
  }
}

export async function desaprovarCirurgias(req, res) {
  const { cpf_paciente, data_hora } = req.params;

  console.log("Chegou no backend:", cpf_paciente, data_hora);

  try {

    const date = new Date(data_hora);

    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":00";

    await pool.query(
      `DELETE FROM "CIRURGIA"
       WHERE cpf_paciente = $1 AND data_hora = $2::timestamp`,
      [cpf_paciente, formatted]
    );

    res.send("Cirurgia removida com sucesso!");
  } catch (error) {
    console.error("Erro ao desaprovar cirurgia:", error);
    res.status(500).send("Erro ao desaprovar cirurgia.");
  }
}
