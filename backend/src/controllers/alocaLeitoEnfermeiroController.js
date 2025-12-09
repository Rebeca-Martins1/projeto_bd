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

export const enfermeirosAtivos = async (req, res) => {
  try {
    const enfermeiros= await pool.query(
        `SELECT p.cpf, p.nome, e.leito_responsavel, e.tipo_leito_responsavel, e.ativo, e.coren 
        FROM "PESSOA" p JOIN "ENFERMEIRO" e ON p.cpf = e.cpf
        WHERE e.ativo = true
        `
    )
    res.json(enfermeiros.rows);
  } catch (error) {
    console.error("Erro ao buscar enfermeiros:", error);
    res.status(500).send("Erro ao carregar enfermeiros.");
  }
};


export const alocaEnfermeiro = async (req, res) => {
  const { cpf, tipo, n_leito } = req.params;

  try {
    await pool.query(
        `UPDATE "ENFERMEIRO"
        SET leito_responsavel = $1, tipo_leito_responsavel = $2 
        WHERE cpf = $3`,
        [n_leito, tipo, cpf]
    );

    res.send("Enfermeiro alocado com sucesso!");
    } catch (error) {
    console.error("Erro ao alocar enfermeiro:", error);
    res.status(500).send("Erro ao alocar enfermeiro.");
    }
};