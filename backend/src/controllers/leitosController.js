import pool from "../config/db.js";

export async function cadastrarLeitos(req, res) {
  const {
    n_sala,
    tipo,
    quant_paciente,
    capacidade,
  } = req.body;

  if (!n_sala || !tipo || !capacidade) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existe = await client.query(
      'SELECT ativo FROM public."LEITOS" WHERE n_sala= $1 AND tipo= $2',
      [n_sala, tipo]
    );

    if (existe.rows.length > 0) {
      if (existe.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(400).send("Já existe um leito cadastrado com esse número e tipo.");
      } 
    } 
    const quant_paciente=0;

    await client.query(
      `INSERT INTO public."LEITOS" (n_sala, tipo, quant_paciente, capacidade)
       VALUES ($1, $2, $3, $4)`,
      [n_sala, tipo, quant_paciente, capacidade]
    );

    await client.query("COMMIT");
    res.status(200).send("Leito cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar leito:", err);
    res.status(500).send("Erro ao cadastrar leito.");
  } finally {
    client.release();
  }
}
