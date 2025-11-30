import pool from "../config/db.js";

export const login = async (req, res) => {
  const { cpf, senha, tipo } = req.body;

  try {
    // 1) Verifica se CPF e senha existem em PESSOA
    const pessoaResult = await pool.query(
      `SELECT cpf, nome, email 
       FROM public."PESSOA"
       WHERE cpf = $1 AND senha = $2`,
      [cpf, senha]
    );

    if (pessoaResult.rows.length === 0) {
      return res.status(401).send("CPF ou senha incorretos.");
    }

    // 2) Verifica se o CPF realmente pertence ao tipo selecionado
    const tabelaPorTipo = {
      paciente: `"PACIENTE"`,
      medico: `"MEDICO"`,
      enfermeiro: `"ENFERMEIRO"`,
      conselho: `"CONSELHO_PRESIDENTE"`,
      adm: `"ADMINISTRADOR"`
    };

    const tabela = tabelaPorTipo[tipo];

    if (!tabela) {
      return res.status(400).send("Tipo inválido.");
    }

    const tipoResult = await pool.query(
      `SELECT 1 FROM ${tabela} WHERE cpf = $1`,
      [cpf]
    );

    if (tipoResult.rows.length === 0) {
      return res.status(403).send("Esta pessoa não possui este tipo de acesso.");
    }

    // 3) Login OK → retorna usuário
    const user = pessoaResult.rows[0];

    res.status(200).json({
      user: {
        cpf: user.cpf,
        nome: user.nome,
        email: user.email,
        tipo: tipo, // tipo selecionado pelo usuário
      },
    });

  } catch (err) {
    console.error("❌ Erro ao fazer login:", err);
    res.status(500).send("Erro ao fazer login.");
  }
};
