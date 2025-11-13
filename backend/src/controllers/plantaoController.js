import pool from "../config/db.js";

export const cadastrarPlantao = async (req, res) => {
  const { cpf, inicio_plantao, inicio_folga } = req.body;

  if (!cpf || !inicio_plantao || !inicio_folga) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  try {
    // Calcula o próximo plantão (apenas para retorno, não salva no banco)
    const folga = new Date(inicio_folga);
    const proximoPlantao = new Date(folga.getTime() + 36 * 60 * 60 * 1000);

    // Atualiza os dados do enfermeiro no banco
    const query = `
      UPDATE public."ENFERMEIRO"
      SET 
        inicio_plantao = $1,
        inicio_folga = $2,
        disponivel = $3
      WHERE cpf = $4
    `;

    const valores = [
      inicio_plantao,
      inicio_folga,
      false, // enfermeiro fica indisponível durante o plantão
      cpf,
    ];

    const resultado = await pool.query(query, valores);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Enfermeiro não encontrado." });
    }

    res.status(200).json({
      mensagem: "Plantão cadastrado com sucesso!",
      proximoPlantao, // apenas retornado na resposta
    });
  } catch (error) {
    console.error("Erro ao cadastrar plantão:", error);
    res.status(500).json({ erro: "Erro no servidor ao cadastrar plantão." });
  }
};
