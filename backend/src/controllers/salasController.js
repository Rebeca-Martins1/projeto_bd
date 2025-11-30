import pool from "../config/db.js";

export async function cadastrarSalas(req, res) {
  const {
    n_sala,
    tipo,
  } = req.body;

  if (!n_sala || !tipo) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existe = await client.query(
      'SELECT ativo FROM public."SALAS" WHERE n_sala= $1 AND tipo= $2',
      [n_sala, tipo]
    );

    if (existe.rows.length > 0) {
      if (existe.rows[0].ativo === true) {
        await client.query("ROLLBACK");
        return res.status(400).send("Já existe uma sala cadastrado com esse número e tipo.");
      } else {
        await client.query(
            `UPDATE public."SALAS" 
            SET ativo = true 
            WHERE n_sala = $1 AND tipo= $2`,
            [n_sala, tipo]
          );
      }
      
    } 


    const quant_paciente=0;

    await client.query(
      `INSERT INTO public."SALAS" (n_sala, tipo)
       VALUES ($1, $2)`,
      [n_sala, tipo]
    );

    await client.query("COMMIT");
    res.status(200).send("✅ Sala cadastrada com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar sala:", err);
    res.status(500).send("Erro ao cadastrar sala.");
  } finally {
    client.release();
  }
}
